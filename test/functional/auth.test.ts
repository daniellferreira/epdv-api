import { Account } from '@src/models/account'
import { User } from '@src/models/user'

describe('Auth functional tests', () => {
  let token: any
  beforeEach(async () => {
    await User.deleteMany()
    await Account.deleteMany()
    const newAccount = {
      name: 'Account test',
      email: 'AccountTest@mail.com',
    }

    await global.testRequest
      .post('/accounts')
      .send({ ...newAccount, password: 'test123456' })

    const responseToken = await global.testRequest
      .post('/auth/token')
      .send({ email: newAccount.email, password: 'test123456' })
    token = responseToken.body['auth-token']
  })
  describe('when authenticating a user', () => {
    it('should generate a token for a valid user', async () => {
      const pwd = 'test123456'
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        tenantId: '1',
      }

      await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send({ ...newUser, password: pwd })

      const responseAuth = await global.testRequest
        .post('/auth/token')
        .send({ email: newUser.email, password: pwd })
      expect(responseAuth.body).toEqual(
        expect.objectContaining({ 'auth-token': expect.any(String) })
      )
    })
    it('Should not get user if email not found', async () => {
      const myEmail = 'mail@mail.com'
      const response = await global.testRequest
        .post('/auth/token')

        .send({ email: myEmail, password: '1234' })

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        cause: 'RECORD_NOTFOUND',
        message: `Record not found or inative with email: ${myEmail}`,
      })
    })

    it('Should not get user if password does not match', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        tenantId: '1',
      }
      const responseCreate = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send({ ...newUser, password: 'test123456' })

      const response = await global.testRequest
        .post('/auth/token')
        .send({ email: newUser.email, password: 'different password' })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        cause: 'UNAUTHORIZED',
        message: `Invalid password`,
      })
    })
  })
})
