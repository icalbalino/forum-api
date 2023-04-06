const DetailThread = require('../../Domains/threads/entities/DetailThread')
const DetailComment = require('../../Domains/comments/entities/DetailComment')

class DetailThreadUseCase {
  constructor ({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
  }

  async execute (useCasePayload) {
    const { threadId } = useCasePayload
    await this._threadRepository.verifyThreadExist(threadId)
    const detailThread = await this._threadRepository.getThreadById(threadId)
    const comments = await this._commentRepository.getCommentsByThreadId(threadId)

    const detailComments = await Promise.all(comments.map(async (comment) => {
      if (comment.is_delete) {
        comment.content = '**komentar telah dihapus**'
      }
      const detailComment = new DetailComment(comment)
      return detailComment
    }))

    return new DetailThread({ ...detailThread, comments: detailComments })
  }
}

module.exports = DetailThreadUseCase
