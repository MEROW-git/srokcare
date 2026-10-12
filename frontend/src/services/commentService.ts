import { apiClient, isMockMode } from './apiClient'
import { mockStorage } from './mockStorage'
import type { Comment } from '@/types/comment'
import type { User } from '@/types/auth'

export const commentService = {
  async getComments(reportId: string): Promise<Comment[]> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 80))
      return mockStorage.getComments(reportId)
    }
    const response = await apiClient.get<Comment[]>(`/reports/${reportId}/comments`)
    return response.data
  },

  async addComment(reportId: string, content: string, user: User): Promise<Comment> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 150))
      return mockStorage.addComment(reportId, content, user)
    }
    const response = await apiClient.post<Comment>(`/reports/${reportId}/comments`, { content })
    return response.data
  },

  async deleteComment(commentId: string): Promise<boolean> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 100))
      return mockStorage.deleteComment(commentId)
    }
    await apiClient.delete(`/comments/${commentId}`)
    return true
  },
}
