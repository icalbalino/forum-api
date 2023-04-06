const DetailThreadUseCase = require('../DetailThreadUseCase')
const DetailThread = require('../../../Domains/threads/entities/DetailThread')
const DeleteComment = require('../../../Domains/comments/entities/DeleteComment')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const CommentRepository = require('../../../Domains/comments/CommentRepository')

describe('DetailThreadUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123'
    }

    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'ini adalah isi dari sebuah thread',
      date: '2021-08-01T07:00:00.000Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          content: 'sebuah comment',
          date: '2021-08-01T07:00:00.000Z',
          username: 'dicoding'
        }
      ]
    })

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(new DetailThread(
        {
          id: 'thread-123',
          title: 'sebuah thread',
          body: 'ini adalah isi dari sebuah thread',
          date: '2021-08-01T07:00:00.000Z',
          username: 'dicoding',
          comments: []
        }
      )))
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          content: 'sebuah comment',
          date: '2021-08-01T07:00:00.000Z',
          username: 'dicoding',
          is_delete: false
        }
      ]))

    /** creating use case instance */
    const detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository
    })

    // Action
    const detailThread = await detailThreadUseCase.execute(useCasePayload)

    // Assert
    expect(detailThread).toEqual(expectedDetailThread)
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(useCasePayload.threadId)
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId)
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId)
  })

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123'
    }

    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'ini adalah isi dari sebuah thread',
      date: '2021-08-01T07:00:00.000Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          content: 'sebuah comment',
          date: '2021-08-01T07:00:00.000Z',
          username: 'dicoding'
        },
        {
          id: 'comment-124',
          content: '**komentar telah dihapus**',
          date: '2021-08-01T07:00:00.000Z',
          username: 'dicoding'
        }
      ]
    })

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(new DetailThread(
        {
          id: 'thread-123',
          title: 'sebuah thread',
          body: 'ini adalah isi dari sebuah thread',
          date: '2021-08-01T07:00:00.000Z',
          username: 'dicoding',
          comments: []
        }
      )))
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          content: 'sebuah comment',
          date: '2021-08-01T07:00:00.000Z',
          username: 'dicoding',
          is_delete: false
        },
        {
          id: 'comment-124',
          content: 'sebuah comment',
          date: '2021-08-01T07:00:00.000Z',
          username: 'dicoding',
          is_delete: true
        }
      ]))

    /** creating use case instance */
    const detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository
    })

    // Action
    const detailThread = await detailThreadUseCase.execute(useCasePayload)

    // Assert
    expect(detailThread).toEqual(expectedDetailThread)
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(useCasePayload.threadId)
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId)
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId)
  })
})
