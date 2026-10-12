import { INITIAL_MOCK_REPORTS, INITIAL_MOCK_COMMENTS } from '@/data/mockReports'
import type { Report, CreateReportInput, UpdateReportInput, ReportFilter, ReportStatus } from '@/types/report'
import type { Comment } from '@/types/comment'
import type { AdminStats } from '@/types/admin'
import type { User } from '@/types/auth'

const STORAGE_KEYS = {
  REPORTS: 'fixkh_mock_reports_v1',
  COMMENTS: 'fixkh_mock_comments_v1',
  USER_SUPPORTS: 'fixkh_user_supported_reports_v1',
}

class MockStorage {
  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_MOCK_REPORTS))
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_MOCK_COMMENTS))
    }
  }

  getReports(filter?: ReportFilter): Report[] {
    this.init()
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS)
    let reports: Report[] = raw ? JSON.parse(raw) : INITIAL_MOCK_REPORTS

    if (!filter) return reports

    // Category filter
    if (filter.category && filter.category !== 'ALL') {
      reports = reports.filter((r) => r.category === filter.category)
    }

    // Status filter
    if (filter.status && filter.status !== 'ALL') {
      reports = reports.filter((r) => r.status === filter.status)
    }

    // Province filter
    if (filter.province && filter.province !== 'ALL') {
      reports = reports.filter((r) => r.province.toLowerCase() === filter.province!.toLowerCase())
    }

    // Search query
    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim()
      reports = reports.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.address && r.address.toLowerCase().includes(q)) ||
          r.district.toLowerCase().includes(q) ||
          r.province.toLowerCase().includes(q)
      )
    }

    // Sorting
    const sortBy = filter.sortBy || 'latest'
    reports = [...reports].sort((a, b) => {
      if (sortBy === 'popular') {
        const scoreA = a.supportCount * 2 + a.commentCount * 3
        const scoreB = b.supportCount * 2 + b.commentCount * 3
        return scoreB - scoreA
      }
      if (sortBy === 'most_supported') {
        return b.supportCount - a.supportCount
      }
      // default: latest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return reports
  }

  getReportById(id: string): Report | null {
    this.init()
    const reports = this.getReports()
    return reports.find((r) => r.id === id) || null
  }

  createReport(input: CreateReportInput, user: User): Report {
    this.init()
    const reports = this.getReports()

    const newReport: Report = {
      id: `rep-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      title: input.title,
      description: input.description,
      category: input.category,
      status: 'REPORTED',
      authorNickname: user.nickname,
      authorId: user.id,
      latitude: input.latitude,
      longitude: input.longitude,
      province: input.province,
      district: input.district,
      address: input.address || '',
      images:
        input.images && input.images.length > 0
          ? input.images
          : ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'],
      supportCount: 0,
      commentCount: 0,
      supportedByMe: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [newReport, ...reports]
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated))
    return newReport
  }

  updateReport(id: string, input: UpdateReportInput): Report {
    this.init()
    const reports = this.getReports()
    const index = reports.findIndex((r) => r.id === id)
    if (index === -1) {
      throw new Error(`Report with id ${id} not found`)
    }

    const updatedReport: Report = {
      ...reports[index],
      ...input,
      updatedAt: new Date().toISOString(),
    }

    reports[index] = updatedReport
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports))
    return updatedReport
  }

  deleteReport(id: string): boolean {
    this.init()
    const reports = this.getReports()
    const filtered = reports.filter((r) => r.id !== id)
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(filtered))
    return true
  }

  toggleSupport(reportId: string): { supportCount: number; supportedByMe: boolean } {
    this.init()
    const reports = this.getReports()
    const index = reports.findIndex((r) => r.id === reportId)
    if (index === -1) {
      throw new Error(`Report ${reportId} not found`)
    }

    const report = reports[index]
    const isSupported = !report.supportedByMe
    const countDelta = isSupported ? 1 : -1

    report.supportedByMe = isSupported
    report.supportCount = Math.max(0, report.supportCount + countDelta)

    reports[index] = report
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports))

    return {
      supportCount: report.supportCount,
      supportedByMe: isSupported,
    }
  }

  getComments(reportId: string): Comment[] {
    this.init()
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS)
    const comments: Comment[] = raw ? JSON.parse(raw) : INITIAL_MOCK_COMMENTS
    return comments
      .filter((c) => c.reportId === reportId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  addComment(reportId: string, content: string, user: User): Comment {
    this.init()
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS)
    const comments: Comment[] = raw ? JSON.parse(raw) : INITIAL_MOCK_COMMENTS

    const newComment: Comment = {
      id: `cmt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      reportId,
      authorNickname: user.nickname,
      authorId: user.id,
      content,
      createdAt: new Date().toISOString(),
    }

    const updatedComments = [...comments, newComment]
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(updatedComments))

    // update commentCount in report
    const reports = this.getReports()
    const repIndex = reports.findIndex((r) => r.id === reportId)
    if (repIndex !== -1) {
      reports[repIndex].commentCount = (reports[repIndex].commentCount || 0) + 1
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports))
    }

    return newComment
  }

  deleteComment(commentId: string): boolean {
    this.init()
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS)
    const comments: Comment[] = raw ? JSON.parse(raw) : INITIAL_MOCK_COMMENTS
    const comment = comments.find((c) => c.id === commentId)

    if (comment) {
      const filtered = comments.filter((c) => c.id !== commentId)
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(filtered))

      const reports = this.getReports()
      const repIndex = reports.findIndex((r) => r.id === comment.reportId)
      if (repIndex !== -1) {
        reports[repIndex].commentCount = Math.max(0, (reports[repIndex].commentCount || 1) - 1)
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports))
      }
    }
    return true
  }

  updateReportStatus(reportId: string, status: ReportStatus): Report {
    this.init()
    const reports = this.getReports()
    const index = reports.findIndex((r) => r.id === reportId)
    if (index === -1) {
      throw new Error(`Report with id ${reportId} not found`)
    }

    reports[index].status = status
    reports[index].updatedAt = new Date().toISOString()
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports))
    return reports[index]
  }

  getAdminStats(): AdminStats {
    this.init()
    const reports = this.getReports()
    const rawComments = localStorage.getItem(STORAGE_KEYS.COMMENTS)
    const comments: Comment[] = rawComments ? JSON.parse(rawComments) : INITIAL_MOCK_COMMENTS

    return {
      totalReports: reports.length,
      reported: reports.filter((r) => r.status === 'REPORTED').length,
      underReview: reports.filter((r) => r.status === 'UNDER_REVIEW').length,
      inProgress: reports.filter((r) => r.status === 'IN_PROGRESS').length,
      resolved: reports.filter((r) => r.status === 'RESOLVED').length,
      rejected: reports.filter((r) => r.status === 'REJECTED').length,
      totalSupports: reports.reduce((acc, curr) => acc + curr.supportCount, 0),
      totalComments: comments.length,
    }
  }

  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_MOCK_REPORTS))
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_MOCK_COMMENTS))
  }
}

export const mockStorage = new MockStorage()
