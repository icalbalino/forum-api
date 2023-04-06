const DetailComment = require('../DetailComment')

describe('a DetailComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'sebuah comment',
      username: 'Dicoding',
      date: '2021-08-08T07:26:17.018Z'
    }

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: true,
      username: {},
      date: {}
    }

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create detailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      username: 'Dicoding',
      date: '2021-08-08T07:26:17.018Z'
    }

    // Action
    const detailComment = new DetailComment(payload)

    // Assert
    expect(detailComment.id).toEqual(payload.id)
    expect(detailComment.content).toEqual(payload.content)
    expect(detailComment.username).toEqual(payload.username)
    expect(detailComment.date).toEqual(payload.date)
  })
})
