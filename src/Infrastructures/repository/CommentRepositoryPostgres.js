const NotFoundError = require('../../Commons/exceptions/NotFoundError')
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError')
const AddedComment = require('../../Domains/comments/entities/AddedComment')
const CommentRepository = require('../../Domains/comments/CommentRepository')

class CommentRepositoryPostgres extends CommentRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addComment (addComment) {
    const id = `comment-${this._idGenerator()}`
    const { content, owner, threadId } = addComment
    const date = new Date().toISOString()
    const isDelete = false

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, date, owner, threadId, isDelete]
    }

    const result = await this._pool.query(query)
    return new AddedComment({ ...result.rows[0] })
  }

  async getCommentsByThreadId (threadId) {
    const query = {
      text: `SELECT comments.id, comments.content, comments.date, comments.is_delete, users.username 
      FROM comments
      LEFT JOIN users ON users.id = comments.owner
      WHERE comments.thread_id = $1 ORDER BY comments.date ASC`,
      values: [threadId]
    }

    const result = await this._pool.query(query)
    return result.rows
  }

  async getCommentById (id) {
    const query = {
      text: `SELECT comments.id, comments.content, comments.date, comments.is_delete, users.username
      FROM comments
      LEFT JOIN users ON users.id = comments.owner
      WHERE comments.id = $1 ORDER BY comments.date ASC`,
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan')
    }

    return result.rows
  }

  async deleteCommentById (id) {
    await this._pool.query('UPDATE comments SET is_delete = $1 WHERE id = $2', [true, id])
  }

  async verifyCommentOwner (id, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan')
    }

    const comment = result.rows
    if (comment[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async verifyCommentExist (id) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan')
    }
  }
}

module.exports = CommentRepositoryPostgres
