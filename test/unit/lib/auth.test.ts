import AuthService from '@src/lib/auth'

describe('Auth unit tests', () => {
  it('should generate an auth token', () => {
    const token = AuthService.generateToken({ token: true })

    expect(token).toHaveProperty('auth-token')
    expect(typeof token['auth-token']).toBe('string')
  })
})
