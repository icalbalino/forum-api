class DeleteComment {
  constructor (payload) {
    this._verifyPayload(payload)

    const { id, owner, threadId } = payload

    this.id = id
    this.owner = owner
    this.threadId = threadId
  }

  _verifyPayload ({ id, owner, threadId }) {
    if (!id || !owner || !threadId) {
      throw new Error('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof id !== 'string' || typeof owner !== 'string' || typeof threadId !== 'string') {
      throw new Error('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = DeleteComment
