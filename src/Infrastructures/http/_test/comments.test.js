const pool = require('../../database/postgres/pool')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const container = require('../../container')
const createServer = require('../createServer')

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
  })

  describe('when POST /comments', () => {
    it('should response 201 and persisted comments', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah comment'
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
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'ini adalah isi dari sebuah thread'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseThread = JSON.parse(thread.payload)
      const threadId = responseThread.data.addedThread.id

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedComment).toBeDefined()

      const { id, content, owner } = responseJson.data.addedComment
      expect(id).toBeDefined()
      expect(content).toBeDefined()
      expect(owner).toBeDefined()
      expect(id).not.toEqual('')
      expect(content).not.toEqual('')
      expect(owner).not.toEqual('')
      expect(typeof id).toEqual('string')
      expect(typeof content).toEqual('string')
      expect(typeof owner).toEqual('string')
    })

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {}
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
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'ini adalah isi dari sebuah thread'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseThread = JSON.parse(thread.payload)
      const threadId = responseThread.data.addedThread.id

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada')
    })

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 123
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
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'ini adalah isi dari sebuah thread'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseThread = JSON.parse(thread.payload)
      const threadId = responseThread.data.addedThread.id

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai')
    })

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah comment'
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
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah comment'
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
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'ini adalah isi dari sebuah thread'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseThread = JSON.parse(thread.payload)
      const threadId = responseThread.data.addedThread.id

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: 'Bearer '
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.message).toEqual('Missing authentication')
    })
  })

  describe('when DELETE /comments/{commentId}', () => {
    it('should response 200', async () => {
      // Arrange
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
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'ini adalah isi dari sebuah thread'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseThread = JSON.parse(thread.payload)
      const threadId = responseThread.data.addedThread.id

      // add comment
      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'sebuah comment'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseComment = JSON.parse(comment.payload)
      const commentId = responseComment.data.addedComment.id

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })

    it('should response 404 when comment not found', async () => {
      // Arrange
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
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'ini adalah isi dari sebuah thread'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseThread = JSON.parse(thread.payload)
      const threadId = responseThread.data.addedThread.id

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-123`,
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.message).toEqual('Komentar tidak ditemukan')
    })

    it('should response 401 when request not contain access token', async () => {
      // Arrange
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
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'ini adalah isi dari sebuah thread'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseThread = JSON.parse(thread.payload)
      const threadId = responseThread.data.addedThread.id

      // add comment
      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'sebuah comment'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseComment = JSON.parse(comment.payload)
      const commentId = responseComment.data.addedComment.id

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: 'Bearer '
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 403 when user not authorized', async () => {
      // Arrange
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

      // add user2
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding2',
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

      // add authentication2
      const accessToken2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding2',
          password: 'secret'
        }
      })

      const responseAccessToken = JSON.parse(accessToken.payload)
      const accessTokenValue = responseAccessToken.data.accessToken

      const responseAccessToken2 = JSON.parse(accessToken2.payload)
      const accessTokenValue2 = responseAccessToken2.data.accessToken

      // add thread
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'ini adalah isi dari sebuah thread'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseThread = JSON.parse(thread.payload)
      const threadId = responseThread.data.addedThread.id

      // add comment
      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'sebuah comment'
        },
        headers: {
          Authorization: `Bearer ${accessTokenValue}`
        }
      })

      const responseComment = JSON.parse(comment.payload)
      const commentId = responseComment.data.addedComment.id

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessTokenValue2}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(403)
      expect(responseJson.message).toEqual('Anda tidak berhak mengakses resource ini')
    })
  })
})
