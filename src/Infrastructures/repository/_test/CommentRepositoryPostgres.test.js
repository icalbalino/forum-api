const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres')
const AddedComment = require('../../../Domains/comments/entities/AddedComment')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError')
const pool = require('../../database/postgres/pool')

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' })
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' })

      const payload = {
        content: 'sebuah comment',
        owner: 'user-123',
        threadId: 'thread-123'
      }

      const fakeIdGenerator = () => '123' // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)

      const expectedAddedComment = new AddedComment({
        id: 'comment-123',
        content: payload.content,
        owner: payload.owner
      })

      // Action and Assert
      const addComment = await commentRepositoryPostgres.addComment(payload)
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123')
      expect(comments).toHaveLength(1)
      expect(addComment).toStrictEqual(expectedAddedComment)
    })
  })

  describe('getCommentsByThreadId function', () => {
    it('should return empty array when comments not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})
      const threadId = 'thread-123'
      const owner = 'user-123'

      await UsersTableTestHelper.addUser({ id: owner })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner })

      // Action & Assert
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(threadId)
      expect(comments).toHaveLength(0)
    })

    it('should return comments correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      const payloadUser = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia'
      }

      const payloadThread = {
        id: 'thread-123',
        title: 'Dicoding Indonesia',
        body: 'Dicoding Indonesia',
        date: '2021-08-08T07:26:17.018Z',
        owner: payloadUser.id
      }

      const payloadComment = {
        id: 'comment-123',
        content: 'sebuah comment',
        date: '2021-08-08T07:26:17.018Z',
        owner: payloadUser.id,
        threadId: payloadThread.id,
        is_delete: false
      }

      const expectedDetailComment = {
        id: payloadComment.id,
        content: payloadComment.content,
        date: payloadComment.date,
        is_delete: payloadComment.is_delete,
        username: payloadUser.username
      }

      await UsersTableTestHelper.addUser(payloadUser)
      await ThreadsTableTestHelper.addThread(payloadThread)
      await CommentsTableTestHelper.addComment(payloadComment)

      // Action & Assert
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(payloadThread.id)
      expect(comments).toHaveLength(1)
      expect(comments).toStrictEqual([expectedDetailComment])
    })

    it('should return comments correctly when comments is deleted', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      const payloadUser = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia'
      }

      const payloadThread = {
        id: 'thread-123',
        title: 'Dicoding Indonesia',
        body: 'Dicoding Indonesia',
        date: '2021-08-08T07:26:17.018Z',
        owner: payloadUser.id
      }

      const payloadComment = {
        id: 'comment-123',
        content: 'sebuah comment',
        date: '2021-08-08T07:26:17.018Z',
        owner: payloadUser.id,
        threadId: payloadThread.id,
        is_delete: false
      }

      const expectedDetailComment = {
        id: payloadComment.id,
        content: payloadComment.content,
        date: payloadComment.date,
        is_delete: true,
        username: payloadUser.username
      }

      await UsersTableTestHelper.addUser(payloadUser)
      await ThreadsTableTestHelper.addThread(payloadThread)
      await CommentsTableTestHelper.addComment(payloadComment)
      await commentRepositoryPostgres.deleteCommentById(payloadComment.id)

      // Action & Assert
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(payloadThread.id)
      expect(comments).toHaveLength(1)
      expect(comments).toStrictEqual([expectedDetailComment])
    })

    it('should return comments correctly and sort by date', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      const payloadUser = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia'
      }

      const payloadThread = {
        id: 'thread-123',
        title: 'Dicoding Indonesia',
        body: 'Dicoding Indonesia',
        date: '2021-08-08T07:26:17.018Z',
        owner: payloadUser.id
      }

      const payloadComment = {
        id: 'comment-123',
        content: 'sebuah comment',
        date: new Date('2021-08-08T07:26:17.018Z').toISOString(),
        owner: payloadUser.id,
        threadId: payloadThread.id,
        is_delete: false
      }

      const payloadComment2 = {
        id: 'comment-456',
        content: 'sebuah comment',
        date: new Date('2021-09-09T07:30:17.018Z').toISOString(),
        owner: payloadUser.id,
        threadId: payloadThread.id,
        is_delete: payloadComment.is_delete
      }

      await UsersTableTestHelper.addUser(payloadUser)
      await ThreadsTableTestHelper.addThread(payloadThread)
      await CommentsTableTestHelper.addComment(payloadComment)
      await CommentsTableTestHelper.addComment(payloadComment2)

      // Action & Assert
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(payloadThread.id)
      expect(comments).toHaveLength(2)
      const comment1 = new Date(comments[0].date).getTime()
      const comment2 = new Date(comments[1].date).getTime()
      expect(comment1).toBeLessThan(comment2)
      expect(comments[0].id).toEqual(payloadComment.id)
      expect(comments[1].id).toEqual(payloadComment2.id)
    })
  })

  describe('getCommentById function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      const payload = {
        id: 'comment-123',
        content: 'sebuah comment',
        date: '2021-08-08T07:26:17.018Z',
        owner: 'user-123',
        threadId: 'thread-123',
        is_delete: false
      }

      await UsersTableTestHelper.addUser({ id: payload.owner })
      await ThreadsTableTestHelper.addThread({ id: payload.threadId, owner: payload.owner })
      await CommentsTableTestHelper.addComment(payload)

      // Action & Assert
      expect(commentRepositoryPostgres.getCommentById('comment-456')).rejects.toThrowError(NotFoundError)
    })

    it('should return comment correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      const payloadUser = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia'
      }

      const payloadThread = {
        id: 'thread-123',
        title: 'Dicoding Indonesia',
        body: 'Dicoding Indonesia',
        date: '2021-08-08T07:26:17.018Z',
        owner: payloadUser.id
      }

      const payloadComment = {
        id: 'comment-123',
        content: 'sebuah comment',
        date: '2021-08-08T07:26:17.018Z',
        owner: payloadUser.id,
        threadId: payloadThread.id,
        is_delete: false
      }

      const expectedComment = {
        id: payloadComment.id,
        content: payloadComment.content,
        date: payloadComment.date,
        is_delete: payloadComment.is_delete,
        username: payloadUser.username
      }

      await UsersTableTestHelper.addUser(payloadUser)
      await ThreadsTableTestHelper.addThread(payloadThread)
      await CommentsTableTestHelper.addComment(payloadComment)

      // Action & Assert
      const comments = await commentRepositoryPostgres.getCommentById(payloadComment.id)
      expect(comments).toHaveLength(1)
      expect(comments[0]).toStrictEqual(expectedComment)
    })
  })

  describe('deleteCommentById function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentById('*****')).rejects.toThrowError(NotFoundError)
    })

    it('should delete comment correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      const payload = {
        id: 'comment-123',
        content: 'sebuah comment',
        date: '2021-08-08T07:26:17.018Z',
        owner: 'user-123',
        threadId: 'thread-123',
        is_delete: false
      }

      await UsersTableTestHelper.addUser({ id: payload.owner })
      await ThreadsTableTestHelper.addThread({ id: payload.threadId, owner: payload.owner })
      await CommentsTableTestHelper.addComment(payload)

      const comments = await commentRepositoryPostgres.getCommentById(payload.id)
      expect(comments[0].is_delete).toEqual(payload.is_delete)

      // Action
      await commentRepositoryPostgres.deleteCommentById(payload.id)

      // Assert
      const commentsAfterDelete = await commentRepositoryPostgres.getCommentById(payload.id)
      expect(commentsAfterDelete[0].is_delete).toEqual(true)
      expect(comments[0].is_delete).not.toEqual(commentsAfterDelete[0].is_delete)
    })
  })

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('*****', '*****')).rejects.toThrowError(NotFoundError)
    })

    it('should throw AuthorizationError when comment not owned', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' })
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' })
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123', threadId: 'thread-123' })
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-456')).rejects.toThrowError(AuthorizationError)
    })

    it('should not throw NotFoundError and AuthorizationError when comment owned', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' })
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' })
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123', threadId: 'thread-123' })
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrowError(AuthorizationError)
    })
  })

  describe('verifyCommentExist function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExist('*****')).rejects.toThrowError(NotFoundError)
    })

    it('should not throw NotFoundError when comment found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' })
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' })
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123', threadId: 'thread-123' })
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExist('comment-123')).resolves.not.toThrowError(NotFoundError)
    })
  })
})
