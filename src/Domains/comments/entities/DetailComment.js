class DetailComment {
  constructor (payload) {
    this._verifyPayload(payload)

    const { id, content, username, date } = payload

    this.id = id
    this.content = content
    this.username = username
    this.date = date
  }

  _verifyPayload ({ id, content, username, date }) {
    if (!id || !content || !username || !date) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof username !== 'string' || typeof date !== 'string') {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = DetailComment
