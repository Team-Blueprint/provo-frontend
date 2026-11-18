import { apiFetch } from "./http";
import { mockAdapter } from "./mockAdapter";
import { getSession, setSession } from "./session";
import type {
  ActiveMonthCell,
  ClientTokenSummary,
  ConsentRecord,
  DayStatus,
  DisputeReason,
  DisputeRecord,
  EscrowJob,
  JobDay,
  JobStatus,
  OutcomeMixItem,
  PagaEventLog,
  ReportPayload,
  ScoreComponent,
  TradeType,
  Worker,
} from "./types";

interface BackendTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  name: string;
  phone: string;
  is_worker: boolean;
  is_client: boolean;
}

interface BackendOTPResponse {
  phone: string;
  message: string;
  expires_in_minutes: number;
  otp_code?: string | null;
}

interface BackendUserProfile {
  id: string;
  name: string;
  phone: string;
  is_worker: boolean;
  is_client: boolean;
  is_supervisor: boolean;
  payout_account_number: string | null;
  payout_bank_code: string | null;
}

interface BackendJobDay {
  id: string;
  day_number: number;
  worker_id?: string | null;
  amount_kobo: number;
  status: DayStatus;
  done_at?: string | null;
  release_at?: string | null;
  proof_photo?: string | null;
}

interface BackendJob {
  id: string;
  client_id: string;
  worker_id: string | null;
  supervisor_id: string | null;
  supervisor_name?: string | null;
  supervisor_phone?: string | null;
  supervisor_token?: string | null;
  trade: string;
  description: string;
  total_kobo: number;
  days: number;
  status: JobStatus;
  funding_reference: string;
  paga_payment_url: string | null;
  paga_account_number: string | null;
  days_schedule: BackendJobDay[];
}

interface BackendWorkerDirectoryItem {
  id: string;
  name: string;
  trade: string;
  area: string;
  verified_days_count: number;
  badge_grade: string;
  paga_account_number?: string | null;
  paga_payment_url?: string | null;
}

interface BackendWorkerRecord {
  worker_id: string;
  name: string;
  phone: string;
  trade: string;
  area: string;
  aggregate_metrics: {
    total_earned_kobo: number;
    total_earned_naira: number;
    confirmed_days: number;
    auto_released_days: number;
    disputed_days: number;
    total_settled_days: number;
  };
  jobs: Array<{
    job_id: string;
    trade: string;
    description: string;
    status: JobStatus;
    total_kobo: number;
    days_count: number;
    days: Array<{
      day_number: number;
      amount_kobo: number;
      status: DayStatus;
      done_at?: string | null;
      release_at?: string | null;
    }>;
  }>;
}

interface BackendReport {
  status: string;
  consent: {
    token: string;
    purpose: string;
    granted_at: string;
    expires_at: string;
    access_count: number;
  };
  artisan: {
    id: string;
    name: string;
    trade: string;
    area: string;
  };
  credit_score: {
    score: number;
    band: string;
    reasons: string[];
    auto_release_ratio: number;
  };
  earnings_summary: {
    total_earned_kobo: number;
    total_earned_naira: number | string;
    total_settled_days: number;
    confirmed_days: number;
    auto_released_days: number;
    disputed_days: number;
  };
  payer_diversity: {
    unique_payers_count: number;
    repeat_payers_count: number;
    max_single_payer_concentration: number;
    exceeds_35_percent_concentration: boolean;
    payers: Array<{
      token: string;
      masked_name?: string;
      jobs_count: number;
      days_settled: number;
      confirmed_days?: number;
      auto_released_days?: number;
      amount_kobo: number;
    }>;
  };
  active_months?: Array<{
    month: string;
    label: string;
    confirmed_days: number;
    total_kobo: number;
  }>;
  jobs?: Array<{
    job_id: string;
    client_token: string;
    trade: string;
    description: string;
    status: JobStatus;
    total_kobo: number;
    days_count: number;
    created_at: string;
    days: Array<{
      day_number: number;
      amount_kobo: number;
      status: DayStatus;
      outcome?: "client" | "supervisor" | "auto" | null;
      done_at?: string | null;
      release_at?: string | null;
    }>;
  }>;
  signed_snapshot?: {
    worker_id: string;
    standing_tier: string;
    standing_score: number;
    signals: {
      confirmed_days: number;
      auto_released_days: number;
      unique_clients: number;
      active_months: number;
      total_paid_naira: number;
    };
    signed_at: string;
    signature: string;
  };
}

interface BackendOutboxItem {
  id: string;
  day_id: string;
  amount_kobo: number;
  idempotency_ref: string;
  status: string;
  attempts: number;
  created_at: string;
}

const FE_TO_BE_TRADE: Record<TradeType, string> = {
  Bricklaying: "BRICKLAYING",
  Plastering: "PLASTERING",
  Tiling: "TILING",
  Painting: "PAINTING",
  Plumbing: "PLUMBING",
  Electrical: "ELECTRICAL",
  Carpentry: "CARPENTRY",
  Others: "OTHER",
};

const BE_TO_FE_TRADE: Record<string, TradeType> = {
  BRICKLAYING: "Bricklaying",
  PLASTERING: "Plastering",
  TILING: "Tiling",
  PAINTING: "Painting",
  PLUMBING: "Plumbing",
  CARPENTRY: "Carpentry",
  ELECTRICAL: "Electrical",
};

function toFrontendTrade(raw: string): TradeType {
  return BE_TO_FE_TRADE[raw.toUpperCase()] ?? "Others";
}

function toBackendTrade(trade: TradeType): string {
  return FE_TO_BE_TRADE[trade] ?? "OTHER";
}

function normalizePhoneNg(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length === 13) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11)
    return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`;
  return raw.startsWith("+") ? raw : `+${digits}`;
}

function mapJobDay(d: BackendJobDay): JobDay {
  return {
    dayNumber: d.day_number,
    amountKobo: d.amount_kobo,
    status: d.status,
    doneAt: d.done_at ?? undefined,
    releaseAt: d.release_at ?? undefined,
    proofPhoto: d.proof_photo ?? undefined,
  };
}

function mapJob(
  j: BackendJob,
  workerNameLookup?: Map<string, string>,
): EscrowJob {
  const workerName =
    (j.worker_id && workerNameLookup?.get(j.worker_id)) || "Assigned artisan";
  return {
    id: j.id,
    clientId: j.client_id,
    clientName: "Employer",
    clientToken: `CL-${j.client_id.slice(0, 6).toUpperCase()}`,
    workerId: j.worker_id ?? "",
    workerName,
    supervisorName:
      j.supervisor_name ?? (j.supervisor_id ? "Site supervisor" : undefined),
    supervisorPhone: j.supervisor_phone ?? undefined,
    supervisorToken: j.supervisor_token ?? undefined,
    trade: toFrontendTrade(j.trade),
    description: j.description,
    area: "Nigeria",
    totalKobo: j.total_kobo,
    daysCount: j.days,
    status: j.status,
    fundingAccountNumber: j.paga_account_number ?? "",
    fundingLink: j.paga_payment_url ?? "",
    days: (j.days_schedule ?? []).map(mapJobDay),
    createdAt: new Date().toISOString(),
  };
}

function mapDirectoryWorker(w: BackendWorkerDirectoryItem): Worker {
  const slug = w.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    id: w.id,
    slug,
    name: w.name,
    phone: "",
    trade: toFrontendTrade(w.trade),
    customTrade: BE_TO_FE_TRADE[w.trade.toUpperCase()] ? undefined : w.trade,
    area: w.area,
    bankName: "Paga",
    bankAccountNumber: "",
    pagaAccountNumber: "",
    telegramHandle: `@${slug}`,
    available: true,
  };
}

function mapReport(r: BackendReport): ReportPayload {
  const totalNaira = Math.round(r.earnings_summary.total_earned_kobo / 100);
  const confirmed = r.earnings_summary.confirmed_days;
  const autoReleased = r.earnings_summary.auto_released_days;
  const totalSettled = Math.max(1, r.earnings_summary.total_settled_days);

  const outcomeMix: OutcomeMixItem[] = [
    {
      outcome: "client",
      count: confirmed,
      amountNaira: Math.round((totalNaira * confirmed) / totalSettled),
      percentage: Math.round((confirmed / totalSettled) * 100),
    },
    {
      outcome: "auto",
      count: autoReleased,
      amountNaira: Math.round((totalNaira * autoReleased) / totalSettled),
      percentage: Math.round((autoReleased / totalSettled) * 100),
    },
  ];

  const clientTokens: ClientTokenSummary[] = r.payer_diversity.payers.map(
    (p, idx) => ({
      token: p.token,
      displayLabel:
        p.masked_name || `Employer ${idx + 1} (#${p.token.split("-").pop()})`,
      phoneVerified: true,
      confirmedDays: p.confirmed_days ?? p.days_settled,
      autoReleasedDays: p.auto_released_days ?? 0,
      monthsActive: 1,
      totalNaira: Math.round(p.amount_kobo / 100),
    }),
  );

  const components: ScoreComponent[] = [
    {
      key: "unique_payers",
      label: "Unique employers",
      points: Math.min(25, r.payer_diversity.unique_payers_count * 5),
      maxPoints: 25,
      detail: `${r.payer_diversity.unique_payers_count} distinct employers`,
    },
    {
      key: "repeat_clients",
      label: "Repeat employers",
      points: Math.min(25, r.payer_diversity.repeat_payers_count * 8),
      maxPoints: 25,
      detail: `${r.payer_diversity.repeat_payers_count} repeat clients`,
    },
    {
      key: "confirmation_quality",
      label: "Confirmation quality",
      points: Math.round((1 - r.credit_score.auto_release_ratio) * 30),
      maxPoints: 30,
      detail: `${confirmed} confirmed vs ${autoReleased} auto-released`,
    },
    {
      key: "deductions",
      label: "Dispute & concentration checks",
      points: r.payer_diversity.exceeds_35_percent_concentration ? 10 : 20,
      maxPoints: 20,
      detail: r.credit_score.reasons[0] ?? "No anomalies flagged",
    },
  ];

  const activeMonths: ActiveMonthCell[] = (r.active_months ?? []).map((m) => ({
    month: m.month,
    label: m.label,
    confirmedDays: m.confirmed_days,
    totalNaira: Math.round(m.total_kobo / 100),
  }));

  const mappedJobs: EscrowJob[] = (r.jobs ?? []).map((j) => ({
    id: j.job_id,
    clientId: "",
    clientName: j.client_token,
    clientToken: j.client_token,
    workerId: r.artisan.id,
    workerName: r.artisan.name,
    trade: toFrontendTrade(j.trade),
    description: j.description,
    area: r.artisan.area,
    totalKobo: j.total_kobo,
    daysCount: j.days_count,
    status: j.status,
    fundingAccountNumber: "",
    fundingLink: "",
    days: j.days.map((d) => ({
      dayNumber: d.day_number,
      amountKobo: d.amount_kobo,
      status: d.status,
      outcome: d.outcome ?? undefined,
      doneAt: d.done_at ?? undefined,
      releaseAt: d.release_at ?? undefined,
    })),
    createdAt: j.created_at,
  }));

  const circularFlags = r.payer_diversity.exceeds_35_percent_concentration
    ? [
        `Single employer accounts for ${Math.round(r.payer_diversity.max_single_payer_concentration * 100)}% of earnings`,
      ]
    : [];

  return {
    reportToken: r.consent.token,
    worker: {
      id: r.artisan.id,
      name: r.artisan.name,
      trade: toFrontendTrade(r.artisan.trade),
      area: r.artisan.area,
    },
    lenderName: r.consent.purpose,
    generatedAt: r.consent.granted_at,
    expiresAt: r.consent.expires_at,
    score: r.credit_score.score,
    band: r.credit_score.band,
    components,
    outcomeMix,
    activeMonths,
    clientTokens,
    jobs: mappedJobs,
    circularFlags,
    signedSnapshot: r.signed_snapshot
      ? {
          workerId: r.signed_snapshot.worker_id,
          standingTier: r.signed_snapshot.standing_tier,
          standingScore: r.signed_snapshot.standing_score,
          signals: {
            confirmedDays: r.signed_snapshot.signals.confirmed_days,
            autoReleasedDays: r.signed_snapshot.signals.auto_released_days,
            uniqueClients: r.signed_snapshot.signals.unique_clients,
            activeMonths: r.signed_snapshot.signals.active_months,
            totalPaidNaira: r.signed_snapshot.signals.total_paid_naira,
          },
          signedAt: r.signed_snapshot.signed_at,
          signature: r.signed_snapshot.signature,
        }
      : {
          workerId: r.artisan.id,
          standingTier: r.credit_score.band,
          standingScore: r.credit_score.score,
          signals: {
            confirmedDays: confirmed,
            autoReleasedDays: autoReleased,
            uniqueClients: r.payer_diversity.unique_payers_count,
            activeMonths: activeMonths.length,
            totalPaidNaira: totalNaira,
          },
          signedAt: r.consent.granted_at,
          signature: r.consent.token,
        },
  };
}

function storeSessionFromTokenResponse(res: BackendTokenResponse): void {
  setSession({
    accessToken: res.access_token,
    refreshToken: res.refresh_token,
    user: {
      id: res.user_id,
      name: res.name,
      phone: res.phone,
      isWorker: res.is_worker,
      isClient: res.is_client,
    },
  });
}

async function fetchWorkerNameLookup(): Promise<Map<string, string>> {
  try {
    const dir = await apiFetch<BackendWorkerDirectoryItem[]>(
      "/workers/available",
      {
        skipAuth: true,
      },
    );
    return new Map(dir.map((w) => [w.id, w.name]));
  } catch {
    return new Map();
  }
}

export const httpAdapter = {
  async getJob(jobId: string): Promise<EscrowJob | null> {
    const [job, names] = await Promise.all([
      apiFetch<BackendJob>(`/jobs/${jobId}`),
      fetchWorkerNameLookup(),
    ]);
    return mapJob(job, names);
  },

  async getAvailableWorkers(trade?: TradeType): Promise<Worker[]> {
    const qs = trade
      ? `?trade=${encodeURIComponent(toBackendTrade(trade))}`
      : "";
    const items = await apiFetch<BackendWorkerDirectoryItem[]>(
      `/workers/available${qs}`,
      {
        skipAuth: true,
      },
    );
    return items.map(mapDirectoryWorker);
  },

  async assignSupervisor(input: {
    jobId: string;
    supervisorName: string;
    supervisorPhone: string;
  }): Promise<EscrowJob | null> {
    const [updated, names] = await Promise.all([
      apiFetch<BackendJob>(`/jobs/${input.jobId}/supervisor`, {
        method: "POST",
        body: JSON.stringify({
          supervisor_name: input.supervisorName,
          supervisor_phone: input.supervisorPhone,
        }),
      }),
      fetchWorkerNameLookup(),
    ]);
    return mapJob(updated, names);
  },

  async getSupervisorJobView(jobId: string, token: string): Promise<EscrowJob> {
    const res = await apiFetch<{
      id: string;
      trade: string;
      description: string;
      total_kobo: number;
      days_count: number;
      status: JobStatus;
      worker_name: string;
      supervisor_name?: string | null;
      supervisor_phone?: string | null;
      days_schedule: BackendJobDay[];
    }>(`/jobs/${jobId}/supervisor-view?token=${encodeURIComponent(token)}`, {
      skipAuth: true,
    });
    return {
      id: res.id,
      clientId: "",
      clientName: "Employer",
      clientToken: "",
      workerId: "",
      workerName: res.worker_name || "Assigned artisan",
      supervisorName: res.supervisor_name ?? undefined,
      supervisorPhone: res.supervisor_phone ?? undefined,
      supervisorToken: token,
      trade: toFrontendTrade(res.trade),
      description: res.description,
      area: "Nigeria",
      totalKobo: res.total_kobo,
      daysCount: res.days_count,
      status: res.status,
      fundingAccountNumber: "",
      fundingLink: "",
      days: res.days_schedule.map(mapJobDay),
      createdAt: new Date().toISOString(),
    };
  },

  async supervisorConfirmDay(input: {
    jobId: string;
    dayNumber: number;
    token: string;
    proofPhoto?: string;
    phone?: string;
  }): Promise<void> {
    await apiFetch(
      `/jobs/${input.jobId}/days/${input.dayNumber}/supervisor-confirm?token=${encodeURIComponent(input.token)}`,
      {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          proof_photo: input.proofPhoto ?? null,
          phone: input.phone ?? null,
        }),
      },
    );
  },

  async supervisorDisputeDay(input: {
    jobId: string;
    dayNumber: number;
    token: string;
    reason: DisputeReason;
  }): Promise<void> {
    await apiFetch(
      `/jobs/${input.jobId}/days/${input.dayNumber}/supervisor-dispute?token=${encodeURIComponent(input.token)}`,
      {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ reason: input.reason }),
      },
    );
  },

  async getWorkerDashboard(): Promise<{
    worker: Worker;
    jobs: EscrowJob[];
    consents: ConsentRecord[];
    reportPreview: ReportPayload;
  }> {
    const me = await apiFetch<BackendUserProfile>("/auth/me");
    const [record, rawJobs, rawShares, names] = await Promise.all([
      apiFetch<BackendWorkerRecord>(`/workers/${me.id}/record`),
      apiFetch<BackendJob[]>(`/jobs?worker_id=${me.id}`),
      apiFetch<
        Array<{
          id: string;
          worker_id: string;
          token: string;
          purpose: string;
          granted_at: string;
          expires_at: string;
          revoked_at?: string | null;
        }>
      >(`/workers/${me.id}/shares`).catch(() => []),
      fetchWorkerNameLookup(),
    ]);

    const consents: ConsentRecord[] = rawShares.map((s) => ({
      id: s.id,
      workerId: s.worker_id,
      lenderName: s.purpose,
      reportToken: s.token,
      grantedAt: s.granted_at,
      expiresAt: s.expires_at,
      revokedAt: s.revoked_at ?? undefined,
    }));

    const worker: Worker = {
      id: me.id,
      slug: me.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: me.name,
      phone: me.phone,
      trade: toFrontendTrade(record.trade),
      area: record.area,
      bankName: me.payout_bank_code ?? "Paga",
      bankAccountNumber: me.payout_account_number ?? "",
      pagaAccountNumber: me.payout_account_number ?? "",
      telegramHandle: "",
      available: true,
    };

    const jobs = rawJobs.map((j) => mapJob(j, names));
    const totalNaira = Math.round(
      record.aggregate_metrics.total_earned_kobo / 100,
    );
    const confirmed = record.aggregate_metrics.confirmed_days;
    const autoReleased = record.aggregate_metrics.auto_released_days;

    const reportPreview: ReportPayload = {
      reportToken: "",
      worker: {
        id: worker.id,
        name: worker.name,
        trade: worker.trade,
        area: worker.area,
      },
      lenderName: "Preview",
      generatedAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      score: Math.min(100, confirmed * 5 + autoReleased * 2),
      band:
        confirmed >= 10
          ? "Strong record"
          : confirmed >= 3
            ? "Steady record"
            : "Early record",
      components: [],
      outcomeMix: [],
      activeMonths: [],
      clientTokens: [],
      jobs,
      circularFlags: [],
      signedSnapshot: {
        workerId: worker.id,
        standingTier: "Early record",
        standingScore: Math.min(100, confirmed * 5 + autoReleased * 2),
        signals: {
          confirmedDays: confirmed,
          autoReleasedDays: autoReleased,
          uniqueClients: new Set(jobs.map((j) => j.clientId)).size,
          activeMonths: 1,
          totalPaidNaira: totalNaira,
        },
        signedAt: new Date().toISOString(),
        signature: "",
      },
    };

    return { worker, jobs, consents, reportPreview };
  },

  async getClientJobs(): Promise<EscrowJob[]> {
    const session = getSession();
    const qs = session?.user.id ? `?client_id=${session.user.id}` : "";
    const [rawJobs, names] = await Promise.all([
      apiFetch<BackendJob[]>(`/jobs${qs}`),
      fetchWorkerNameLookup(),
    ]);
    return rawJobs.map((j) => mapJob(j, names));
  },

  async getSupervisorJobs(): Promise<EscrowJob[]> {
    const session = getSession();
    const qs = session?.user.id ? `?supervisor_id=${session.user.id}` : "";
    const [rawJobs, names] = await Promise.all([
      apiFetch<BackendJob[]>(`/jobs${qs}`),
      fetchWorkerNameLookup(),
    ]);
    return rawJobs.map((j) => mapJob(j, names));
  },

  async createAndRequestFunding(input: {
    clientName: string;
    workerId: string;
    trade: TradeType;
    description: string;
    area: string;
    totalNaira: number;
    daysCount: number;
    supervisorName?: string;
    supervisorPhone?: string;
    daysBreakdown?: Array<{
      dayNumber: number;
      amountKobo?: number;
      workerId?: string;
    }>;
  }): Promise<EscrowJob> {
    const created = await apiFetch<BackendJob>("/jobs", {
      method: "POST",
      body: JSON.stringify({
        trade: toBackendTrade(input.trade),
        description: input.description,
        total_kobo: Math.round(input.totalNaira * 100),
        days: input.daysCount,
        worker_id: input.workerId || null,
        supervisor_id: null,
        auto_fund_request: true,
        days_breakdown: input.daysBreakdown?.map((d) => ({
          day_number: d.dayNumber,
          amount_kobo: d.amountKobo ?? null,
          worker_id: d.workerId ?? null,
        })),
      }),
    });

    const jobWithFunding = created.paga_account_number
      ? created
      : await apiFetch<BackendJob>(`/jobs/${created.id}/fund-request`, {
          method: "POST",
        });
    const names = await fetchWorkerNameLookup();
    return mapJob(jobWithFunding, names);
  },

  async simulateFundJob(
    jobId: string,
    amountNaira?: number,
  ): Promise<EscrowJob> {
    const job = await this.getJob(jobId);
    if (!job) throw new Error("Job not found");
    if (!job.fundingAccountNumber) {
      throw new Error("No Paga account number assigned to this job yet.");
    }
    const depositAmount = amountNaira ?? Math.round(job.totalKobo / 100);
    await apiFetch("/sandbox/simulate-deposit", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({
        account_number: job.fundingAccountNumber,
        amount: depositAmount,
      }),
    });
    const updated = await this.getJob(jobId);
    if (!updated) throw new Error("Job not found");
    return updated;
  },

  async getWorkerPaymentLink(workerId: string): Promise<{
    workerId: string;
    workerName: string;
    accountNumber: string;
    bank: string;
    paymentUrl: string;
    shareText: string;
  } | null> {
    try {
      const res = await apiFetch<{
        worker_id: string;
        worker_name: string;
        account_number: string;
        bank: string;
        payment_url: string;
        share_text: string;
      }>(`/workers/${workerId}/payment-link`, { skipAuth: true });
      return {
        workerId: res.worker_id,
        workerName: res.worker_name,
        accountNumber: res.account_number,
        bank: res.bank,
        paymentUrl: res.payment_url,
        shareText: res.share_text,
      };
    } catch {
      return null;
    }
  },

  async markDayDone(jobId: string, dayNumber: number): Promise<EscrowJob> {
    await apiFetch<BackendJobDay>(`/jobs/${jobId}/days/${dayNumber}/done`, {
      method: "POST",
    });
    const updated = await this.getJob(jobId);
    if (!updated) throw new Error("Job not found");
    return updated;
  },

  async confirmDay(
    jobId: string,
    dayNumber: number,
    _actor: "client" | "supervisor",
  ): Promise<EscrowJob> {
    await apiFetch<BackendJobDay>(`/jobs/${jobId}/days/${dayNumber}/confirm`, {
      method: "POST",
    });
    const updated = await this.getJob(jobId);
    if (!updated) throw new Error("Job not found");
    return updated;
  },

  async disputeDay(
    jobId: string,
    dayNumber: number,
    reason: DisputeReason,
    _raisedBy?: "client" | "supervisor",
  ): Promise<void> {
    await apiFetch<BackendJobDay>(`/jobs/${jobId}/days/${dayNumber}/dispute`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async simulateAutoReleaseNext(): Promise<{ message: string }> {
    return { message: "Auto-release is handled by the backend scheduler." };
  },

  async createConsent(
    lenderName: string,
    daysValid = 7,
  ): Promise<ConsentRecord> {
    const session = getSession();
    const workerId = session?.user.id;
    if (!workerId) throw new Error("Sign in as a worker first.");

    const res = await apiFetch<{
      token: string;
      report_url: string;
      expires_at: string;
      purpose: string;
    }>(`/workers/${workerId}/shares`, {
      method: "POST",
      body: JSON.stringify({
        purpose: lenderName,
        valid_days: daysValid,
      }),
    });

    return {
      id: res.token,
      workerId,
      lenderName: res.purpose,
      reportToken: res.token,
      grantedAt: new Date().toISOString(),
      expiresAt: res.expires_at,
    };
  },

  async revokeConsent(token: string): Promise<void> {
    const session = getSession();
    const workerId = session?.user.id;
    if (!workerId) throw new Error("Sign in as a worker first.");
    await apiFetch(`/workers/${workerId}/shares/${token}/revoke`, {
      method: "POST",
    });
  },

  async getWorkerSettings(): Promise<{ alertChannel: "whatsapp" | "sms" }> {
    const session = getSession();
    const workerId = session?.user.id;
    if (!workerId) return { alertChannel: "whatsapp" };
    const res = await apiFetch<{
      worker_id: string;
      alert_channel: "whatsapp" | "sms";
    }>(`/workers/${workerId}/settings`);
    return { alertChannel: res.alert_channel };
  },

  async updateWorkerSettings(alertChannel: "whatsapp" | "sms"): Promise<{
    alertChannel: "whatsapp" | "sms";
  }> {
    const session = getSession();
    const workerId = session?.user.id;
    if (!workerId) throw new Error("Sign in as a worker first.");
    const res = await apiFetch<{
      worker_id: string;
      alert_channel: "whatsapp" | "sms";
    }>(`/workers/${workerId}/settings`, {
      method: "PATCH",
      body: JSON.stringify({ alert_channel: alertChannel }),
    });
    return { alertChannel: res.alert_channel };
  },

  async verifyReceipt(receiptNumber: string): Promise<{
    id: string;
    receipt_number: string;
    job_id: string;
    issued_at: string;
    receipt_data: Record<string, unknown>;
  }> {
    return apiFetch(`/jobs/verify/${encodeURIComponent(receiptNumber)}`, {
      skipAuth: true,
    });
  },

  async resendOtp(
    phone: string,
  ): Promise<{ sent: boolean; demoCode: string; phone: string }> {
    const normalized = normalizePhoneNg(phone);
    const res = await apiFetch<BackendOTPResponse>("/auth/resend-otp", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ phone: normalized }),
    });
    return { sent: true, demoCode: res.otp_code ?? "", phone: res.phone };
  },

  async getReport(reportToken: string): Promise<ReportPayload> {
    try {
      const raw = await apiFetch<BackendReport>(`/reports/${reportToken}`, {
        skipAuth: true,
      });
      return mapReport(raw);
    } catch (err) {
      if (reportToken === "rep_emem_lapo_2026") {
        return mockAdapter.getReport(reportToken);
      }
      throw err;
    }
  },

  async getAdminOverview(): Promise<{
    disputes: DisputeRecord[];
    pagaEvents: PagaEventLog[];
  }> {
    const [rawDisputes, outbox] = await Promise.all([
      apiFetch<
        Array<{
          id: string;
          job_id: string;
          day_number: number;
          worker_name: string;
          client_token: string;
          amount_kobo: number;
          reason: DisputeReason;
          raised_by: "client" | "supervisor";
          status: "open" | "upheld" | "dismissed";
          created_at: string;
        }>
      >("/admin/disputes"),
      apiFetch<BackendOutboxItem[]>("/admin/outbox"),
    ]);
    const disputes: DisputeRecord[] = rawDisputes.map((d) => ({
      id: d.id,
      jobId: d.job_id,
      dayNumber: d.day_number,
      workerName: d.worker_name,
      clientToken: d.client_token,
      amountNaira: Math.round(d.amount_kobo / 100),
      reason: d.reason,
      raisedBy: d.raised_by,
      status: d.status,
      createdAt: d.created_at,
    }));
    const pagaEvents: PagaEventLog[] = outbox.map((item) => ({
      id: item.id,
      eventType: "DAY_PAYOUT",
      reference: item.day_id,
      idempotencyKey: item.idempotency_ref,
      hashValid: true,
      reconcileVerified: item.status === "SUCCESS",
      amountNaira: Math.round(item.amount_kobo / 100),
      receivedAt: item.created_at,
      outcome: item.status,
    }));
    return { disputes, pagaEvents };
  },

  async resolveDispute(
    disputeId: string,
    resolution: "uphold" | "dismiss",
  ): Promise<void> {
    await apiFetch(`/admin/disputes/${disputeId}/resolve`, {
      method: "POST",
      body: JSON.stringify({
        action:
          resolution === "uphold" ? "REFUND_TO_CLIENT" : "RELEASE_TO_WORKER",
        resolution_note:
          resolution === "uphold"
            ? "Dispute upheld by admin review."
            : "Dispute dismissed; releasing pay to worker.",
      }),
    });
  },

  async assignWorkerToJob(input: {
    jobId: string;
    workerPhone?: string;
    workerId?: string;
  }): Promise<EscrowJob> {
    const [updated, names] = await Promise.all([
      apiFetch<BackendJob>(`/jobs/${input.jobId}/assign`, {
        method: "POST",
        body: JSON.stringify({
          worker_phone: input.workerPhone
            ? normalizePhoneNg(input.workerPhone)
            : null,
          worker_id: input.workerId ?? null,
        }),
      }),
      fetchWorkerNameLookup(),
    ]);
    return mapJob(updated, names);
  },

  async requestSetPin(phone: string): Promise<{ message: string }> {
    const normalized = normalizePhoneNg(phone);
    return apiFetch<{ message: string }>("/auth/request-set-pin", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ phone: normalized }),
    });
  },

  async setPin(input: {
    phone: string;
    otpCode: string;
    newPin: string;
  }): Promise<{ isWorker: boolean; isClient: boolean }> {
    const normalized = normalizePhoneNg(input.phone);
    const res = await apiFetch<BackendTokenResponse>("/auth/set-pin", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({
        phone: normalized,
        otp_code: input.otpCode,
        new_pin: input.newPin,
      }),
    });
    storeSessionFromTokenResponse(res);
    return { isWorker: res.is_worker, isClient: res.is_client };
  },

  async loginWithPin(input: { phone: string; pin: string }): Promise<Worker> {
    const normalized = normalizePhoneNg(input.phone);
    const res = await apiFetch<BackendTokenResponse>("/auth/login", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ phone: normalized, pin: input.pin }),
    });
    storeSessionFromTokenResponse(res);

    return {
      id: res.user_id,
      slug: res.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: res.name,
      phone: res.phone,
      trade: "Bricklaying",
      area: "Nigeria",
      bankName: "Paga",
      bankAccountNumber: "",
      pagaAccountNumber: "",
      telegramHandle: "",
      available: true,
    };
  },

  async sendWorkerOtp(
    phone: string,
  ): Promise<{ sent: boolean; demoCode: string; phone: string }> {
    const normalized = normalizePhoneNg(phone);
    const res = await apiFetch<BackendOTPResponse>("/auth/resend-otp", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ phone: normalized }),
    });
    return { sent: true, demoCode: res.otp_code ?? "", phone: res.phone };
  },

  async sendSignupOtp(input: {
    name: string;
    phone: string;
    pin: string;
    role: "worker" | "client";
    trade?: TradeType;
  }): Promise<{ sent: boolean; demoCode: string; phone: string }> {
    const normalized = normalizePhoneNg(input.phone);
    const res = await apiFetch<BackendOTPResponse>("/auth/signup", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({
        name: input.name,
        phone: normalized,
        pin: input.pin,
        role: input.role,
        trade:
          input.role === "worker" && input.trade
            ? toBackendTrade(input.trade)
            : null,
      }),
    });
    return { sent: true, demoCode: res.otp_code ?? "", phone: res.phone };
  },

  async ussdRegister(input: {
    phone: string;
    name: string;
    trade: TradeType;
    pin: string;
  }): Promise<{ message: string }> {
    const normalized = normalizePhoneNg(input.phone);
    return apiFetch<{ message: string }>("/ussd/register", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({
        phone: normalized,
        name: input.name,
        trade: toBackendTrade(input.trade),
        pin: input.pin,
      }),
    });
  },

  async getUssdBalance(phone: string): Promise<{
    phone: string;
    workerName: string;
    trade: string;
    totalEarnedKobo: number;
    totalEarnedNaira: string;
    availableBalanceKobo: number;
    availableBalanceNaira: string;
    pagaAccountNumber: string;
    displayText: string;
  }> {
    const normalized = normalizePhoneNg(phone);
    const res = await apiFetch<{
      phone: string;
      worker_name: string;
      trade: string;
      total_earned_kobo: number;
      total_earned_naira: string;
      available_balance_kobo?: number;
      available_balance_naira?: string;
      paga_account_number: string;
      display_text: string;
    }>(`/ussd/balance?phone=${encodeURIComponent(normalized)}`, {
      skipAuth: true,
    });
    return {
      phone: res.phone,
      workerName: res.worker_name,
      trade: res.trade,
      totalEarnedKobo: res.total_earned_kobo,
      totalEarnedNaira: res.total_earned_naira,
      availableBalanceKobo: res.available_balance_kobo ?? res.total_earned_kobo,
      availableBalanceNaira: res.available_balance_naira ?? res.total_earned_naira,
      pagaAccountNumber: res.paga_account_number,
      displayText: res.display_text,
    };
  },

  async getUssdPendingJobs(phone: string): Promise<{
    phone: string;
    totalPendingJobs: number;
    jobs: Array<{
      jobId: string;
      trade: string;
      description: string;
      totalNaira: string;
      currentDay: number;
      totalDays: number;
      dayStatus: string;
    }>;
    displayText: string;
  }> {
    const normalized = normalizePhoneNg(phone);
    const res = await apiFetch<{
      phone: string;
      total_pending_jobs: number;
      jobs: Array<{
        job_id: string;
        trade: string;
        description: string;
        total_naira: string;
        current_day: number;
        total_days: number;
        day_status: string;
      }>;
      display_text: string;
    }>(`/ussd/pending-jobs?phone=${encodeURIComponent(normalized)}`, {
      skipAuth: true,
    });
    return {
      phone: res.phone,
      totalPendingJobs: res.total_pending_jobs,
      jobs: res.jobs.map((j) => ({
        jobId: j.job_id,
        trade: j.trade,
        description: j.description,
        totalNaira: j.total_naira,
        currentDay: j.current_day,
        totalDays: j.total_days,
        dayStatus: j.day_status,
      })),
      displayText: res.display_text,
    };
  },

  async ussdReportDone(
    phone: string,
    jobId: string,
  ): Promise<{ displayText: string }> {
    const normalized = normalizePhoneNg(phone);
    const res = await apiFetch<{ display_text: string }>("/ussd/report-done", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ phone: normalized, job_id: jobId }),
    });
    return { displayText: res.display_text };
  },

  async ussdWithdraw(
    phone: string,
    amountNaira?: number,
    options?: { accountNumber?: string; bankCode?: string; pin?: string },
  ): Promise<{ displayText: string }> {
    const normalized = normalizePhoneNg(phone);
    const res = await apiFetch<{ display_text: string }>("/ussd/withdraw", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({
        phone: normalized,
        amount_naira: amountNaira ?? null,
        account_number: options?.accountNumber ?? null,
        bank_code: options?.bankCode ?? null,
        pin: options?.pin ?? null,
      }),
    });
    return { displayText: res.display_text };
  },

  async verifyWorkerLogin(input: {
    phone: string;
    otp: string;
  }): Promise<Worker> {
    const normalized = normalizePhoneNg(input.phone);
    const res = await apiFetch<BackendTokenResponse>("/auth/verify-otp", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ phone: normalized, code: input.otp }),
    });
    storeSessionFromTokenResponse(res);

    return {
      id: res.user_id,
      slug: res.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: res.name,
      phone: res.phone,
      trade: "Bricklaying",
      area: "Nigeria",
      bankName: "Paga",
      bankAccountNumber: "",
      pagaAccountNumber: "",
      telegramHandle: "",
      available: true,
    };
  },

  async verifyWorkerSignup(input: {
    name: string;
    phone: string;
    trade: TradeType;
    customTrade?: string;
    otp: string;
  }): Promise<Worker> {
    const normalized = normalizePhoneNg(input.phone);
    const res = await apiFetch<BackendTokenResponse>("/auth/verify-otp", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ phone: normalized, code: input.otp }),
    });
    storeSessionFromTokenResponse(res);

    return {
      id: res.user_id,
      slug: res.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: res.name,
      phone: res.phone,
      trade: input.trade,
      customTrade: input.customTrade,
      area: "Nigeria",
      bankName: "Paga",
      bankAccountNumber: "",
      pagaAccountNumber: "",
      telegramHandle: "",
      available: true,
    };
  },
};
