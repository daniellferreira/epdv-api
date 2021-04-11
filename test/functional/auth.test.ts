import AuthService from '@src/lib/auth'
import { authMiddleware } from '@src/middlewares/auth'

describe('AuthMiddleware', () => {
  it('should verify a JWT token and call the next middleware', async () => {
    // await User.deleteMany()
    // const newUser = {
    //   name: 'John Doe',
    //   email: 'john@mail.com',
    // }

    // const response = await global.testRequest
    //   .post('/users')
    //   .send({ ...newUser, password: 'test123456' })

    // const responseAuth = await global.testRequest
    //   .post('/users/authenticate')
    //   .send({ email: newUser.email, password: 'test123456' })

    // const jwtToken = responseAuth.body
    const jwtToken = AuthService.generateToken({ data: 'fake' })
    const reqFake = {
      headers: {
        'x-access-token': jwtToken['auth-token'],
      },
    }
    const resFake = {}
    const nextFake = jest.fn()

    authMiddleware(reqFake, resFake, nextFake)
    expect(nextFake).toHaveBeenCalled()
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
      code: 401,
      cause: 'UNAUTHORIZED',
      menssage: 'jwt malformed',
    })
  })

  it('should return UNAUTHORIZED if theres no token', async () => {
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
      code: 401,
      cause: 'UNAUTHORIZED',
      menssage: 'jwt must be provided',
    })
  })
})
