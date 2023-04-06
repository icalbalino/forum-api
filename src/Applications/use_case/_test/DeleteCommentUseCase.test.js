const DeleteComment = require('../../../Domains/comments/entities/DeleteComment')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const DeleteCommentUseCase = require('../DeleteCommentUseCase')

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      id: 'comment-123',
      owner: 'user-123',
      threadId: 'thread-123'
    }

    const deleteComment = new DeleteComment(useCasePayload)

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.verifyCommentExist = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve())

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    // Action
    await deleteCommentUseCase.execute(useCasePayload)

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(deleteComment.threadId)
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith(deleteComment.id)
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(deleteComment.id, deleteComment.owner)
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(deleteComment.id)
  })
})
