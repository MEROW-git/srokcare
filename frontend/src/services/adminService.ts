import { apiClient, isMockMode } from './apiClient'
import { mockStorage } from './mockStorage'
import type { Report, ReportFilter, ReportStatus } from '@/types/report'
import type { AdminStats } from '@/types/admin'

export const adminService = {
  async getAdminReports(filter?: ReportFilter): Promise<Report[]> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 100))
      return mockStorage.getReports(filter)
    }
    const response = await apiClient.get<Report[]>('/admin/reports', { params: filter })
    return response.data
  },

  async updateStatus(reportId: string, status: ReportStatus): Promise<Report> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 150))
      return mockStorage.updateReportStatus(reportId, status)
    }
    const response = await apiClient.patch<Report>(`/admin/reports/${reportId}/status`, { status })
    return response.data
  },

  async getAdminStats(): Promise<AdminStats> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 80))
      return mockStorage.getAdminStats()
    }
    const response = await apiClient.get<AdminStats>('/admin/stats')
    return response.data
  },
}
