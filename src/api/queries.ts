import { queryOptions } from '@tanstack/react-query'
import { api } from '@/api/client'

export function workerDashboardQueryOptions() {
  return queryOptions({
    queryKey: ['worker', 'dashboard'] as const,
    queryFn: () => api.getWorkerDashboard(),
  })
}

export function workerSettingsQueryOptions() {
  return queryOptions({
    queryKey: ['worker', 'settings'] as const,
    queryFn: () => api.getWorkerSettings(),
  })
}

export function clientJobsQueryOptions() {
  return queryOptions({
    queryKey: ['employer', 'jobs'] as const,
    queryFn: () => api.getClientJobs(),
  })
}

export function availableWorkersQueryOptions() {
  return queryOptions({
    queryKey: ['workers', 'available'] as const,
    queryFn: () => api.getAvailableWorkers(),
  })
}

export function lenderReportQueryOptions(reportToken: string) {
  return queryOptions({
    queryKey: ['report', reportToken] as const,
    queryFn: () => api.getReport(reportToken),
    enabled: Boolean(reportToken),
  })
}
