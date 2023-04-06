const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const DetailThread = require('../../../Domains/threads/entities/DetailThread')
const AddedThread = require('../../../Domains/threads/entities/AddedThread')
const AddThread = require('../../../Domains/threads/entities/AddThread')
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres')
const pool = require('../../database/postgres/pool')

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' })
      const user = await UsersTableTestHelper.findUsersById('user-123')

      const payload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: user[0].id
      }

      const addThread = new AddThread(payload)

      const fakeIdGenerator = () => '123' // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator)

      const expectedAddedThread = new AddedThread({
        id: 'thread-123',
        title: payload.title,
        owner: payload.owner
      })

      // Action and Assert
      const addedThread = await threadRepositoryPostgres.addThread(addThread)
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123')
      expect(threads).toHaveLength(1)
      expect(addedThread).toStrictEqual(expectedAddedThread)
    })
  })

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})

      // Action and Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-123')).rejects.toThrowError(NotFoundError)
    })

    it('should return detail thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding'
      })
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:26:17.018Z',
        owner: 'user-123'
      })

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})
      const expectedDetailThread = new DetailThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:26:17.018Z',
        username: 'dicoding',
        comments: []
      })

      // Action
      const detailThread = await threadRepositoryPostgres.getThreadById('thread-123')

      // Assert
      expect(detailThread).toStrictEqual(expectedDetailThread)
    })
  })

  describe('verifyThreadExist function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})

      // Action and Assert
      await expect(threadRepositoryPostgres.verifyThreadExist('*****')).rejects.toThrowError(NotFoundError)
    })

    it('should not throw NotFoundError when thread found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' })
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' })
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})

      // Action and Assert
      await expect(threadRepositoryPostgres.verifyThreadExist('thread-123')).resolves.not.toThrowError(NotFoundError)
    })
  })
})
