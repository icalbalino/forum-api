const DeleteComment = require('../../Domains/comments/entities/DeleteComment')

class DeleteCommentUseCase {
  constructor ({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (useCasePayload) {
    const deleteComment = new DeleteComment(useCasePayload)
    const { id, owner, threadId } = deleteComment
    await this._threadRepository.verifyThreadExist(threadId)
    await this._commentRepository.verifyCommentExist(id)
    await this._commentRepository.verifyCommentOwner(id, owner)
    await this._commentRepository.deleteCommentById(id)
  }
}

module.exports = DeleteCommentUseCase
