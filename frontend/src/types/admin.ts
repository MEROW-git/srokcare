import type { ReportStatus } from './report'

export interface AdminStats {
  totalReports: number
  reported: number
  underReview: number
  inProgress: number
  resolved: number
  rejected: number
  totalSupports: number
  totalComments: number
}

export interface UpdateStatusInput {
  status: ReportStatus
  adminNote?: string
}
