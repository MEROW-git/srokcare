export interface Comment {
  id: string
  reportId: string
  authorNickname: string
  authorId?: string
  content: string
  createdAt: string
}

export interface CreateCommentInput {
  reportId: string
  content: string
}
