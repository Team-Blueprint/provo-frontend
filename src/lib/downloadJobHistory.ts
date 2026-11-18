import type { EscrowJob, ReportPayload } from '@/api/types'
import { formatNaira, formatShortDate } from '@/lib/format'

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function downloadJobHistoryImage(report: ReportPayload, jobs: EscrowJob[]): void {
  const width = 920
  const padX = 40
  const padY = 36
  const cardGap = 14
  const rowHeight = 96
  const headerHeight = 128
  const footerHeight = 52
  const contentHeight =
    jobs.length > 0 ? jobs.length * rowHeight + (jobs.length - 1) * cardGap : 80
  const height = padY * 2 + headerHeight + contentHeight + footerHeight

  const dpr = 2
  const canvas = document.createElement('canvas')
  canvas.width = width * dpr
  canvas.height = height * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.scale(dpr, dpr)

  // Background
  ctx.fillStyle = '#FAFCFF'
  ctx.fillRect(0, 0, width, height)

  // Top brand accent bar
  ctx.fillStyle = '#003170'
  ctx.fillRect(0, 0, width, 6)

  // Header
  ctx.fillStyle = '#003170'
  ctx.font = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.fillText('PROVO · VERIFIED JOB HISTORY', padX, padY + 14)

  ctx.fillStyle = '#090D16'
  ctx.font = '600 24px system-ui, -apple-system, sans-serif'
  ctx.fillText(`${report.worker.name} · ${report.worker.trade}`, padX, padY + 48)

  ctx.fillStyle = '#64748B'
  ctx.font = '400 13px system-ui, -apple-system, sans-serif'
  ctx.fillText(
    `${report.worker.area} · Generated ${formatShortDate(report.generatedAt)} · Expires ${formatShortDate(report.expiresAt)}`,
    padX,
    padY + 72,
  )

  // Verified pay summary pill on top-right
  const totalVerifiedNaira = jobs.reduce((sum, j) => sum + Math.round(j.totalKobo / 100), 0)
  const pillW = 168
  const pillH = 48
  const pillX = width - padX - pillW
  const pillY = padY + 16
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 10)
  ctx.fillStyle = '#F1F5F9'
  ctx.fill()
  ctx.strokeStyle = '#CBD5E1'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = '#003170'
  ctx.font = '700 18px system-ui, -apple-system, sans-serif'
  ctx.fillText(formatNaira(totalVerifiedNaira), pillX + 16, pillY + 25)
  ctx.fillStyle = '#64748B'
  ctx.font = '500 11px system-ui, -apple-system, sans-serif'
  ctx.fillText(
    `${jobs.length} ${jobs.length === 1 ? 'verified job' : 'verified jobs'}`,
    pillX + 16,
    pillY + 40,
  )

  // Divider
  ctx.strokeStyle = '#E2E8F0'
  ctx.beginPath()
  ctx.moveTo(padX, padY + 98)
  ctx.lineTo(width - padX, padY + 98)
  ctx.stroke()

  let cursorY = padY + headerHeight

  if (jobs.length === 0) {
    ctx.fillStyle = '#64748B'
    ctx.font = '400 14px system-ui, -apple-system, sans-serif'
    ctx.fillText('No verified jobs match the selected filter.', padX, cursorY + 28)
    cursorY += 80
  } else {
    for (const job of jobs) {
      drawRoundedRect(ctx, padX, cursorY, width - padX * 2, rowHeight, 10)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()
      ctx.strokeStyle = '#E2E8F0'
      ctx.lineWidth = 1
      ctx.stroke()

      const totalNaira = formatNaira(Math.round(job.totalKobo / 100))
      ctx.fillStyle = '#090D16'
      ctx.font = '600 15px system-ui, -apple-system, sans-serif'
      ctx.fillText(`${job.trade} · ${job.clientToken || 'Tokenized Employer'}`, padX + 18, cursorY + 28)

      ctx.fillStyle = '#003170'
      ctx.font = '700 16px system-ui, -apple-system, sans-serif'
      const amtWidth = ctx.measureText(totalNaira).width
      ctx.fillText(totalNaira, width - padX - 18 - amtWidth, cursorY + 28)

      ctx.fillStyle = '#475569'
      ctx.font = '400 13px system-ui, -apple-system, sans-serif'
      const desc =
        job.description.length > 74 ? `${job.description.slice(0, 71)}...` : job.description
      ctx.fillText(desc, padX + 18, cursorY + 52)

      const paidDays = job.days.filter((d) => d.status === 'PAID' || d.status === 'CONFIRMED').length
      ctx.fillStyle = '#1E7B4B'
      ctx.font = '500 12px ui-monospace, SFMono-Regular, Menlo, monospace'
      ctx.fillText(
        `${job.status} · ${paidDays}/${job.daysCount} days settled`,
        padX + 18,
        cursorY + 76,
      )

      cursorY += rowHeight + cardGap
    }
  }

  // Footer
  ctx.fillStyle = '#64748B'
  ctx.font = '400 11px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.fillText(
    `NDPA consent-gated · Employer identities masked · Token: ${report.reportToken}`,
    padX,
    height - padY + 8,
  )

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const slug = report.worker.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    link.href = url
    link.download = `provo-job-history-${slug}.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, 'image/png')
}
