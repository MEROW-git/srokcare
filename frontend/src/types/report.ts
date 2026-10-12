export type ReportCategory =
  | 'ROAD_DAMAGE'
  | 'STREETLIGHT'
  | 'GARBAGE'
  | 'FLOODING'
  | 'DRAINAGE'
  | 'TRAFFIC_SAFETY'
  | 'PUBLIC_FACILITY'
  | 'OTHER'

export type ReportStatus =
  | 'REPORTED'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'

export interface Report {
  id: string
  title: string
  description: string
  category: ReportCategory
  status: ReportStatus
  authorNickname: string
  authorId?: string
  latitude: number
  longitude: number
  province: string
  district: string
  address?: string
  images: string[]
  supportCount: number
  commentCount: number
  supportedByMe: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateReportInput {
  title: string
  description: string
  category: ReportCategory
  latitude: number
  longitude: number
  province: string
  district: string
  address?: string
  images?: string[]
}

export interface UpdateReportInput {
  title?: string
  description?: string
  category?: ReportCategory
  address?: string
  province?: string
  district?: string
}

export type SortOption = 'latest' | 'popular' | 'most_supported'

export interface ReportFilter {
  category?: ReportCategory | 'ALL'
  status?: ReportStatus | 'ALL'
  province?: string | 'ALL'
  search?: string
  sortBy?: SortOption
}
