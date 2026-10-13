import { apiClient, isMockMode } from './apiClient'
import { mockStorage } from './mockStorage'
import type { Report, CreateReportInput, UpdateReportInput, ReportFilter } from '@/types/report'
import type { User } from '@/types/auth'

export const reportService = {
  async getReports(filter?: ReportFilter): Promise<Report[]> {
    if (isMockMode()) {
      // Simulate minor network delay for realistic UI skeleton state
      await new Promise((res) => setTimeout(res, 120))
      return mockStorage.getReports(filter)
    }
    const response = await apiClient.get<Report[]>('/reports', { params: filter })
    return response.data
  },

  async getReportById(id: string): Promise<Report> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 80))
      const report = mockStorage.getReportById(id)
      if (!report) {
        throw new Error(`Report not found with id ${id}`)
      }
      return report
    }
    const response = await apiClient.get<Report>(`/reports/${id}`)
    return response.data
  },

  async createReport(input: CreateReportInput, user: User): Promise<Report> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 300))
      return mockStorage.createReport(input, user)
    }
    const response = await apiClient.post<Report>('/reports', input)
    return response.data
  },

  async updateReport(id: string, input: UpdateReportInput): Promise<Report> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 200))
      return mockStorage.updateReport(id, input)
    }
    const response = await apiClient.put<Report>(`/reports/${id}`, input)
    return response.data
  },

  async deleteReport(id: string): Promise<boolean> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 150))
      return mockStorage.deleteReport(id)
    }
    await apiClient.delete(`/reports/${id}`)
    return true
  },

  async toggleSupport(id: string): Promise<{ supportCount: number; supportedByMe: boolean }> {
    if (isMockMode()) {
      return mockStorage.toggleSupport(id)
    }
    const response = await apiClient.post<{ supportCount: number; supportedByMe: boolean }>(`/reports/${id}/support`)
    return response.data
  },

  async getMyReports(userId: string, userNickname: string, page = 0, size = 20): Promise<Report[]> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 100))
      const all = mockStorage.getReports()
      return all.filter((r) => r.authorId === userId || r.authorNickname === userNickname)
        .slice(page * size, (page + 1) * size)
    }
    const response = await apiClient.get<Report[]>('/reports/my', { params: { page, size } })
    return response.data
  },
}
