export type ReportEventType =
  | 'REPORT_CREATED'
  | 'REPORT_UPDATED'
  | 'REPORT_DELETED'
  | 'REPORT_STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'COMMENT_DELETED'
  | 'SUPPORT_CHANGED'

export interface RealtimeReportEvent {
  eventType: ReportEventType
  reportId: string
  timestamp: string
}
