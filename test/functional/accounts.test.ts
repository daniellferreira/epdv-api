import { User } from '@src/models/user'
import { Account } from '@src/models/account'

describe('Accounts functional tests', () => {
  beforeAll(async () => {
    await User.deleteMany()
    await Account.deleteMany()
  })

  describe('When creating a new account', () => {
    it('should successfully create a new account and user', async () => {
      const newAccount = {
        name: 'John Doe',
        email: 'john@mail.com',
      }

      const response = await global.testRequest
        .post('/accounts')
        .send({ ...newAccount, password: 'test123456' })

      expect(response.status).toBe(201)
      expect(response.body).toEqual(expect.objectContaining(newAccount))
    })

    it('should not create a new account cause a duplicate email', async () => {
      const newAccount = {
        name: 'Jane Doe',
        email: 'jane@mail.com',
        password: 'jane123456',
      }

      await global.testRequest.post('/accounts').send(newAccount)
      const response = await global.testRequest
        .post('/accounts')
        .send(newAccount)
      expect(response.status).toBe(422)
      expect(response.body).toEqual({
        cause: 'VALIDATION_ERROR',
        errors: {
          email: 'There is already a record with the same value',
        },
        message: 'There are validation errors',
      })
    })
  })
})
