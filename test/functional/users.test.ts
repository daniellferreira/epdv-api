import { Types } from 'mongoose'
import { User } from '@src/models/user'
import { Account } from '@src/models/account'

describe('Users functional tests', () => {
  let token: any
  let userMaster: any
  beforeEach(async () => {
    await User.deleteMany()
    await Account.deleteMany()
    const newAccount = {
      name: 'Account test',
      email: 'AccountTest@mail.com',
    }

    const response = await global.testRequest
      .post('/accounts')
      .send({ ...newAccount, password: 'test123456' })
    userMaster = response.body

    let responseToken = await global.testRequest
      .post('/auth/token')
      .send({ email: newAccount.email, password: 'test123456' })
    token = responseToken.body['auth-token']
  })
  describe('When creating a new user', () => {
    it('should successfully create a new user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
      }
      const response = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send({ ...newUser, password: 'test123456' })
      expect(response.status).toBe(201)
      expect(response.body).toEqual(expect.objectContaining(newUser))
    })

    it('should not create a new user cause a duplicate email', async () => {
      const newUser = {
        name: 'Jane Doe',
        email: 'jane@mail.com',
        password: 'jane123456',
        tenantId: '1',
      }

      await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send(newUser)
      const response = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send(newUser)
      expect(response.status).toBe(422)
      expect(response.body).toEqual({
        cause: 'VALIDATION_ERROR',
        errors: {
          email: 'There is already a record with the same value',
        },
        message: 'There are validation errors',
      })
    })

    it('should not create a new user without token', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john+1@mail.com',
      }
      const response = await global.testRequest
        .post('/users')
        .send({ ...newUser, password: 'test123456' })
      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        cause: 'UNAUTHORIZED',
        message: 'jwt must be provided',
      })
    })
  })

  describe('When getting a user', () => {
    it('should successfully get a created user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john2@mail.com',
        password: 'test123456',
      }

      const responseCreate = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send(newUser)

      const { name, email } = newUser
      const { id, createdAt, updatedAt, account, isAdmin } = responseCreate.body

      const responseGet = await await global.testRequest
        .get('/users/id')
        .set({ 'x-access-token': token })
        .send({ id: id })

      expect(responseGet.status).toBe(200)
      expect(responseGet.body).toEqual({
        name,
        email,
        id,
        account,
        isAdmin,
        createdAt,
        updatedAt,
      })
    })

    it('should not get a invalid userId', async () => {
      const userId = 12323213

      const responseGet = await global.testRequest
        .get('/users/id')
        .set({
          'x-access-token': token,
        })
        .send({ id: userId })

      expect(responseGet.status).toBe(404)
      expect(responseGet.body).toEqual({
        cause: 'RECORD_NOTFOUND',
        message: `Record not found with id: ${userId}`,
      })
    })

    it('should not get a not found userId', async () => {
      const userId = Types.ObjectId().toHexString()

      const responseGet = await global.testRequest
        .get('/users/id')
        .set({
          'x-access-token': token,
        })
        .send({ id: userId })

      expect(responseGet.status).toBe(404)
      expect(responseGet.body).toEqual({
        cause: 'RECORD_NOTFOUND',
        message: `Record not found with id: ${userId}`,
      })
    })

    it('should not get a created user without token', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john2@mail.com',
        password: 'test123456',
      }

      const responseCreate = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send(newUser)

      const { name, email } = newUser
      const { id, createdAt, updatedAt, account, isAdmin } = responseCreate.body

      const responseGet = await await global.testRequest
        .get(`/users/${id}`)
        .send()

      expect(responseGet.status).toBe(401)
      expect(responseGet.body).toEqual({
        cause: 'UNAUTHORIZED',
        message: 'jwt must be provided',
      })
    })
  })

  describe('When listing the users', () => {
    it('should list two created users', async () => {
      let user1 = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: 'test123456',
      }

      let user2 = {
        name: 'Jane Doe',
        email: 'jane@mail.com',
        password: 'test123456',
      }

      const respUser1 = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send(user1)
      user1 = respUser1.body

      const respUser2 = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send(user2)
      user2 = respUser2.body

      const responseList = await global.testRequest
        .get('/users')
        .set({
          'x-access-token': token,
        })
        .send()

      expect(responseList.status).toBe(200)
      // userMaster = account created beforeEach
      expect(responseList.body).toEqual([userMaster, user1, user2])
    })

    it('should not list created users without token', async () => {
      const response = await global.testRequest.get('/users').send()

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        cause: 'UNAUTHORIZED',
        message: 'jwt must be provided',
      })
    })
  })

  describe('When listing the users', () => {
    it('should edit a created user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john2@mail.com',
      }

      const responseCreate = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send({ ...newUser, password: 'test123456' })

      const responseEdit = await global.testRequest
        .put(`/users/${responseCreate.body.id}`)
        .set({
          'x-access-token': token,
        })
        .send({ name: 'Jane Doe' })

      expect(responseEdit.status).toBe(200)
      expect(responseEdit.body).toStrictEqual({
        ...responseCreate.body,
        name: 'Jane Doe',
        updatedAt: responseEdit.body.updatedAt,
      })
    })

    it('should not edit a created user without token', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john2@mail.com',
      }

      const responseCreate = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send({ ...newUser, password: 'test123456' })

      const responseEdit = await global.testRequest
        .put(`/users/${responseCreate.body.id}`)
        .send({ name: 'Jane Doe' })

      expect(responseEdit.status).toBe(401)
      expect(responseEdit.body).toEqual({
        cause: 'UNAUTHORIZED',
        message: 'jwt must be provided',
      })
    })
  })

  describe('when authenticating a user', () => {
    it('should generate a token for a valid user', async () => {
      let pwd = 'test123456'
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
        .send({ ...newUser, password: pwd })

      const responseAuth = await global.testRequest
        .post('/auth/token')
        .send({ email: newUser.email, password: pwd })
      expect(responseAuth.body).toEqual(
        expect.objectContaining({ 'auth-token': expect.any(String) })
      )
    })

    it('Should not get user if email not found', async () => {
      let myEmail = 'mail@mail.com'
      const response = await global.testRequest
        .post('/auth/token')

        .send({ email: myEmail, password: '1234' })

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        cause: 'RECORD_NOTFOUND',
        message: `Record not found with email: ${myEmail}`,
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

  describe('When searching the users', () => {
    it('should find two created users', async () => {
      let user1 = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: 'test123456',
      }

      let user2 = {
        name: 'Jane Doe',
        email: 'jane@mail.com',
        password: 'test123456',
      }

      const respUser1 = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send(user1)
      user1 = respUser1.body

      const respUser2 = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send(user2)
      user2 = respUser2.body

      const responseSearch = await global.testRequest
        .get('/users/search')
        .set({
          'x-access-token': token,
        })
        .send({ name: 'doe', email: 'mail.com' })

      expect(responseSearch.status).toBe(200)
      expect(responseSearch.body).toEqual([user2, user1])
    })

    it('should find all created users', async () => {
      let user1 = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: 'test123456',
      }

      let user2 = {
        name: 'Jane Doe',
        email: 'jane@mail.com',
        password: 'test123456',
      }

      const respUser1 = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send(user1)
      user1 = respUser1.body

      const respUser2 = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send(user2)
      user2 = respUser2.body

      const responseSearch = await global.testRequest
        .get('/users/search')
        .set({
          'x-access-token': token,
        })
        .send({ name: '', email: '' })

      expect(responseSearch.status).toBe(200)
      // userMaster = account created beforeEach
      expect(responseSearch.body).toEqual([userMaster, user2, user1])
    })
  })
})
