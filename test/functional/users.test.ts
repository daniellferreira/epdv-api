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

    const responseToken = await global.testRequest
      .post('/auth/token')
      .send({ email: newAccount.email, password: 'test123456' })
    token = responseToken.body['auth-token']
  })
  describe('When creating new user', () => {
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

  describe('When getting user', () => {
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
      const { id, createdAt, updatedAt, account, active, isAdmin } =
        responseCreate.body

      const responseGet = await global.testRequest
        .get(`/users/${id}`)
        .set({ 'x-access-token': token })
        .send()

      expect(responseGet.status).toBe(200)
      expect(responseGet.body).toEqual({
        active: true,
        name,
        email,
        id,
        account,
        isAdmin,
        createdAt,
        updatedAt,
        scope: ['admin'],
      })
    })

    it('should not get a invalid userId', async () => {
      const userId = 12323213

      const responseGet = await global.testRequest
        .get(`/users/${userId}`)
        .set({
          'x-access-token': token,
        })
        .send()

      expect(responseGet.status).toBe(404)
      expect(responseGet.body).toEqual({
        cause: 'RECORD_NOTFOUND',
        message: `Record not found with id: ${userId}`,
      })
    })

    it('should not get a not found userId', async () => {
      const userId = Types.ObjectId().toHexString()

      const responseGet = await global.testRequest
        .get(`/users/${userId}`)
        .set({
          'x-access-token': token,
        })
        .send()

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

      const { id } = responseCreate.body

      const responseGet = await global.testRequest.get(`/users/${id}`).send()

      expect(responseGet.status).toBe(401)
      expect(responseGet.body).toEqual({
        cause: 'UNAUTHORIZED',
        message: 'jwt must be provided',
      })
    })
  })

  describe('When listing users', () => {
    it('should list all created users', async () => {
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
      expect(responseList.body).toEqual({
        docs: [userMaster, user1, user2],
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        nextPage: null,
        page: 1,
        pagingCounter: 1,
        prevPage: null,
        totalDocs: 3,
        totalPages: 1,
      })
    })

    it('should not list created users without token', async () => {
      const response = await global.testRequest.get('/users').send()

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        cause: 'UNAUTHORIZED',
        message: 'jwt must be provided',
      })
    })

    it('should find two created users names contains "doe"', async () => {
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

      const response = await global.testRequest
        .get('/users/?s=doe')
        .set({
          'x-access-token': token,
        })
        .send()

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        docs: [user1, user2],
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        nextPage: null,
        page: 1,
        pagingCounter: 1,
        prevPage: null,
        totalDocs: 2,
        totalPages: 1,
      })
    })

    it('should find two created users emails contains "mail"', async () => {
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

      const response = await global.testRequest
        .get('/users/?s=mail')
        .set({
          'x-access-token': token,
        })
        .send()

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        docs: [userMaster, user1, user2],
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        nextPage: null,
        page: 1,
        pagingCounter: 1,
        prevPage: null,
        totalDocs: 3,
        totalPages: 1,
      })
    })

    it('should not find created users from another account', async () => {
      const newAccount = {
        name: 'Account test2',
        email: 'AccountTest2@mail.com',
      }
      await global.testRequest
        .post('/accounts')
        .send({ ...newAccount, password: 'test123456' })

      let user1 = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: 'test123456',
      }

      const respUser1 = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send(user1)
      user1 = respUser1.body

      const response = await global.testRequest
        .get('/users/')
        .set({
          'x-access-token': token,
        })
        .send()

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        docs: [userMaster, user1],
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        nextPage: null,
        page: 1,
        pagingCounter: 1,
        prevPage: null,
        totalDocs: 2,
        totalPages: 1,
      })
    })

    it('should find three created users, separete them into two pages and sort name,asc', async () => {
      let user1 = {
        name: 'Jane Doe2',
        email: 'john@mail.com',
        password: 'test123456',
      }

      let user2 = {
        name: 'Jane Doe1',
        email: 'jane+1@mail.com',
        password: 'test123456',
      }

      let user3 = {
        name: 'Jane Doe2',
        email: 'jane+2@mail.com',
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

      const respUser3 = await global.testRequest
        .post('/users')
        .set({
          'x-access-token': token,
        })
        .send(user3)
      user3 = respUser3.body

      const response = await global.testRequest
        .get('/users/?active=true&s=doe&limit=1&page=1&sort=name,asc')
        .set({
          'x-access-token': token,
        })
        .send()

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        docs: [user2],
        hasNextPage: true,
        hasPrevPage: false,
        limit: 1,
        nextPage: 2,
        page: 1,
        pagingCounter: 1,
        prevPage: null,
        totalDocs: 3,
        totalPages: 3,
      })
    })
  })

  describe('When editing the users', () => {
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
})
