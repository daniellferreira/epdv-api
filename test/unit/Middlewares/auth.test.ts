import auth from '@src/lib/auth'
import { authMiddleware } from '@src/middlewares/auth'

describe('Auth unit tests', () => {
  it('should generate and decote token', () => {
    const token = auth.generateToken({ 'x-acces-token': 'test' })
    const data = auth.decodeToken(token['auth-token']) as any
    expect(data['x-acces-token']).toBe('test')
  })

  it('should return UNAUTHORIZED if there is a problem on the token verification', () => {
    const reqFake = {
      headers: {
        'x-access-token': 'invalid token',
      },
    }
    const sendMock = jest.fn()
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    }
    const nextFake = jest.fn()
    authMiddleware(reqFake, resFake as object, nextFake)
    expect(resFake.status).toHaveBeenCalledWith(401)
    expect(sendMock).toHaveBeenCalledWith({
      cause: 'UNAUTHORIZED',
      message: 'jwt malformed',
    })
  })

  it('should return UNAUTHORIZED if there is no headers', () => {
    const reqFake = {}
    const sendMock = jest.fn()
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    }
    const nextFake = jest.fn()
    authMiddleware(reqFake, resFake as object, nextFake)
    expect(resFake.status).toHaveBeenCalledWith(401)
    expect(sendMock).toHaveBeenCalledWith({
      cause: 'UNAUTHORIZED',
      message: 'jwt must be provided',
    })
  })

  it('should return UNAUTHORIZED if there is no token', async () => {
    const reqFake = {
      headers: {},
    }
    const sendMock = jest.fn()
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    }
    const nextFake = jest.fn()

    authMiddleware(reqFake, resFake as object, nextFake)

    expect(resFake.status).toHaveBeenCalledWith(401)
    expect(sendMock).toHaveBeenCalledWith({
      cause: 'UNAUTHORIZED',
      message: 'jwt must be provided',
    })
  })
})
