export type ReportInteraction = 'publish' | 'support' | 'comment' | 'share'

export const reportReturnPath = (reportId: string, action: ReportInteraction): string => {
  const path = `/reports/${encodeURIComponent(reportId)}`
  return action === 'comment' ? `${path}#comments` : path
}

export const reportPublicUrl = (reportId: string, origin: string): string =>
  new URL(reportReturnPath(reportId, 'share'), origin).href

export const facebookShareUrl = (publicUrl: string): string =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`

export const safeReturnPath = (requested: unknown): string =>
  typeof requested === 'string' && requested.startsWith('/') && !requested.startsWith('//') && !/[\\\r\n]/.test(requested)
    ? requested
    : '/feed'
