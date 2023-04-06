const AddComment = require('../../Domains/comments/entities/AddComment')

class AddCommentUseCase {
  constructor ({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (useCasePayload) {
    const { threadId } = useCasePayload
    await this._threadRepository.verifyThreadExist(threadId)
    const addComment = new AddComment(useCasePayload)
    return this._commentRepository.addComment(addComment)
  }
}

module.exports = AddCommentUseCase
