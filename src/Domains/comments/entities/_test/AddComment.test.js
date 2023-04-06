const AddComment = require('../AddComment')

describe('a AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      content: 'sebuah comment'
    }

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 123,
      content: true,
      owner: {}
    }

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create addComment object correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      content: 'sebuah comment',
      owner: 'user-123'
    }

    // Action
    const addComment = new AddComment(payload)

    // Assert
    expect(addComment.threadId).toEqual(payload.threadId)
    expect(addComment.content).toEqual(payload.content)
    expect(addComment.owner).toEqual(payload.owner)
  })
})
