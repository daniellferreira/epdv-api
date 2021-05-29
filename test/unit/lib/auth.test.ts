import AuthService from '@src/lib/auth'

describe('Auth unit tests', () => {
  it('should generate an auth token', () => {
    const token = AuthService.generateToken({ token: true })

    expect(token).toHaveProperty('auth-token')
    expect(typeof token['auth-token']).toBe('string')
  })

  it('should decode an auth token', () => {
    const token = AuthService.generateToken({ token: true })
    const tokenDecoded = AuthService.decodeToken(token['auth-token'])

    expect(tokenDecoded).toMatchObject({ token: true })
  })

  it('should hash and compare password', async () => {
    const hashedPassoword = await AuthService.hashPassword('test')
    const compare = AuthService.comparePasswords('test', hashedPassoword)

    expect(compare).toMatchObject({})
  })
})
