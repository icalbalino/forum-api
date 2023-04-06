const pool = require('../../database/postgres/pool')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const container = require('../../container')
const createServer = require('../createServer')

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
  })

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread'
      }
      const server = await createServer(container)

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia'
        }
      })

      // add authentication
      const accessToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret'
        }
      })

      const responseAccessToken = JSON.parse(accessToken.payload)
      const accessTokenValue = responseAccessToken.data.accessToken

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(responseJson).toBeDefined()
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data).toBeDefined()
      expect(responseJson.data.addedThread).toBeDefined()

      const { addedThread } = responseJson.data
      expect(addedThread.id).toBeDefined()
      expect(addedThread.id).not.toEqual('')
      expect(addedThread.id).not.toEqual(null)
      expect(typeof addedThread.id).toEqual('string')
      expect(addedThread.title).toBeDefined()
      expect(addedThread.title).not.toEqual('')
      expect(addedThread.title).not.toEqual(null)
      expect(typeof addedThread.title).toEqual('string')
      expect(addedThread.owner).toBeDefined()
      expect(addedThread.owner).not.toEqual('')
      expect(addedThread.owner).not.toEqual(null)
      expect(typeof addedThread.owner).toEqual('string')
    })

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread'
      }
      const server = await createServer(container)

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia'
        }
      })

      // add authentication
      const accessToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret'
        }
      })

      const responseAccessToken = JSON.parse(accessToken.payload)
      const accessTokenValue = responseAccessToken.data.accessToken

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada')
    })

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 123,
        body: true
      }
      const server = await createServer(container)

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia'
        }
      })

      // add authentication
      const accessToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret'
        }
      })

      const responseAccessToken = JSON.parse(accessToken.payload)
      const accessTokenValue = responseAccessToken.data.accessToken

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai')
    })

    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).not.toEqual('')
      expect(responseJson.message).not.toEqual(null)
      expect(responseJson.message).toEqual('Missing authentication')
    })
  })

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and thread detail', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread'
      }
      const server = await createServer(container)

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia'
        }
      })

      // add authentication
      const accessToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret'
        }
      })

      const responseAccessToken = JSON.parse(accessToken.payload)
      const accessTokenValue = responseAccessToken.data.accessToken

      // add thread
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      const threadId = responseJson.data.addedThread.id

      // add comment
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'sebuah comment'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Action
      const responseThread = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Assert
      const responseThreadJson = JSON.parse(responseThread.payload)
      expect(responseThread.statusCode).toEqual(200)
      expect(responseThreadJson.status).toEqual('success')
      expect(responseThreadJson.data.thread).toBeDefined()

      expect(typeof responseThreadJson.data.thread.id).toEqual('string')
      expect(typeof responseThreadJson.data.thread.title).toEqual('string')
      expect(typeof responseThreadJson.data.thread.body).toEqual('string')
      expect(typeof responseThreadJson.data.thread.username).toEqual('string')
      expect(typeof responseThreadJson.data.thread.date).toEqual('string')

      expect(responseThreadJson.data.thread.id).toBeDefined()
      expect(responseThreadJson.data.thread.title).toBeDefined()
      expect(responseThreadJson.data.thread.body).toBeDefined()
      expect(responseThreadJson.data.thread.username).toBeDefined()
      expect(responseThreadJson.data.thread.date).toBeDefined()

      expect(responseThreadJson.data.thread.id).not.toEqual('')
      expect(responseThreadJson.data.thread.title).not.toEqual('')
      expect(responseThreadJson.data.thread.body).not.toEqual('')
      expect(responseThreadJson.data.thread.username).not.toEqual('')
      expect(responseThreadJson.data.thread.date).not.toEqual('')

      expect(responseThreadJson.data.thread.comments).toBeDefined()
      expect(responseThreadJson.data.thread.comments).toHaveLength(1)
    })

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread'
      }
      const server = await createServer(container)

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia'
        }
      })

      // add authentication
      const accessToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret'
        }
      })

      const responseAccessToken = JSON.parse(accessToken.payload)
      const accessTokenValue = responseAccessToken.data.accessToken

      // add thread
      await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/123',
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should response 200 and thread detail without comment', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread'
      }
      const server = await createServer(container)

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia'
        }
      })

      // add authentication
      const accessToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret'
        }
      })

      const responseAccessToken = JSON.parse(accessToken.payload)
      const accessTokenValue = responseAccessToken.data.accessToken

      // add thread
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      const threadId = responseJson.data.addedThread.id

      // add comment
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'sebuah comment'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseCommentJson = JSON.parse(responseComment.payload)
      const commentId = responseCommentJson.data.addedComment.id

      // delete comment
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Action
      const responseThread = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Assert
      const responseThreadJson = JSON.parse(responseThread.payload)
      expect(responseThread.statusCode).toEqual(200)
      expect(responseThreadJson.status).toEqual('success')
      expect(responseThreadJson.data.thread).toBeDefined()

      expect(typeof responseThreadJson.data.thread.id).toEqual('string')
      expect(typeof responseThreadJson.data.thread.title).toEqual('string')
      expect(typeof responseThreadJson.data.thread.body).toEqual('string')
      expect(typeof responseThreadJson.data.thread.username).toEqual('string')
      expect(typeof responseThreadJson.data.thread.date).toEqual('string')

      expect(responseThreadJson.data.thread.id).toBeDefined()
      expect(responseThreadJson.data.thread.title).toBeDefined()
      expect(responseThreadJson.data.thread.body).toBeDefined()
      expect(responseThreadJson.data.thread.username).toBeDefined()
      expect(responseThreadJson.data.thread.date).toBeDefined()

      expect(responseThreadJson.data.thread.id).not.toEqual('')
      expect(responseThreadJson.data.thread.title).not.toEqual('')
      expect(responseThreadJson.data.thread.body).not.toEqual('')
      expect(responseThreadJson.data.thread.username).not.toEqual('')
      expect(responseThreadJson.data.thread.date).not.toEqual('')

      expect(responseThreadJson.data.thread.comments).toBeDefined()
      expect(responseThreadJson.data.thread.comments).toHaveLength(1)
      expect(responseThreadJson.data.thread.comments[0].content).toEqual('**komentar telah dihapus**')
    })

    it('should response 200 and thread detail and sort comment by date', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread'
      }
      const server = await createServer(container)

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia'
        }
      })

      // add authentication
      const accessToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret'
        }
      })

      const responseAccessToken = JSON.parse(accessToken.payload)
      const accessTokenValue = responseAccessToken.data.accessToken

      // add thread
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      const threadId = responseJson.data.addedThread.id

      // add comment
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'sebuah comment'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // add comment2
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'sebuah comment'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Action
      const responseThread = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Assert
      const responseThreadJson = JSON.parse(responseThread.payload)
      expect(responseThread.statusCode).toEqual(200)
      expect(responseThreadJson.status).toEqual('success')
      expect(responseThreadJson.data.thread).toBeDefined()

      expect(responseThreadJson.data.thread.comments).toBeDefined()
      expect(responseThreadJson.data.thread.comments).toHaveLength(2)

      const comment1 = new Date(responseThreadJson.data.thread.comments[0].date).getTime()
      const comment2 = new Date(responseThreadJson.data.thread.comments[1].date).getTime()
      expect(comment1).toBeLessThan(comment2)
    })
  })
})
