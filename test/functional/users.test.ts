import { Types } from 'mongoose'
import { User } from '@src/models/user'

describe('Users functional tests', () => {
  beforeAll(async () => {
    await User.deleteMany()
  })
  describe('When creating a new user', () => {
    it('should successfully create a new user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
      }

      const response = await global.testRequest
        .post('/users')
        .send({ ...newUser, password: 'test123456' })
      expect(response.status).toBe(201)
      expect(response.body).toEqual(expect.objectContaining(newUser))
    })

    it('should not create a new user cause a duplicate email', async () => {
      const newUser = {
        name: 'Jane Doe',
        email: 'jane@mail.com',
        password: 'jane123456',
      }

      await global.testRequest.post('/users').send(newUser)
      const response = await global.testRequest.post('/users').send(newUser)
      expect(response.status).toBe(422) //409
      expect(response.body).toEqual({
        cause: 'VALIDATION_ERROR',
        errors: {
          email: 'There is already a record with the same value',
        },
        message: 'There are validation errors',
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
        .send(newUser)

      const { name, email } = newUser
      const { id, createdAt, updatedAt } = responseCreate.body

      const responseGet = await global.testRequest.get(`/users/${id}`).send()

      expect(responseGet.status).toBe(200)
      expect(responseGet.body).toEqual({
        name,
        email,
        id,
        createdAt,
        updatedAt,
      })
    })

    it('should not get a invalid userId', async () => {
      const userId = 12323213

      const responseGet = await global.testRequest
        .get(`/users/${userId}`)
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
        .send()

      expect(responseGet.status).toBe(404)
      expect(responseGet.body).toEqual({
        cause: 'RECORD_NOTFOUND',
        message: `Record not found with id: ${userId}`,
      })
    })
  })

  it('Should not get user if email not found', async () => {
    let myEmail = 'mail@mail.com'
    const response = await global.testRequest
      .post('/auth')
      .send({ email: myEmail, password: '1234' })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      cause: 'RECORD_NOTFOUND',
      message: `Record not found with email: ${myEmail}`,
    })
  })

  describe('When listing the users', () => {
    beforeEach(async () => {
      await User.deleteMany()
    })

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

      const respUser1 = await global.testRequest.post('/users').send(user1)
      user1 = respUser1.body

      const respUser2 = await global.testRequest.post('/users').send(user2)
      user2 = respUser2.body

      const responseList = await global.testRequest.get('/users').send()

      expect(responseList.status).toBe(200)
      expect(responseList.body).toEqual([user1, user2])
    })

    it('should return an empty array', async () => {
      const response = await global.testRequest.get('/users').send()

      expect(response.status).toBe(200)
      expect(response.body).toEqual([])
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
        .send({ ...newUser, password: 'test123456' })

      const responseEdit = await global.testRequest
        .put(`/users/${responseCreate.body.id}`)
        .send({ name: 'Jane Doe' })

      expect(responseEdit.status).toBe(200)
      expect(responseEdit.body).toStrictEqual({
        ...responseCreate.body,
        name: 'Jane Doe',
        updatedAt: responseEdit.body.updatedAt,
      })
    })
  })

  describe('when authenticating a user', () => {
    it('should generate a token for a valid user', async () => {
      let pwd = 'test123456'
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
      }

      const responseCreate = await global.testRequest
        .post('/users')
        .send({ ...newUser, password: pwd })

      const responseAuth = await global.testRequest
        .post('/auth')
        .send({ email: newUser.email, password: pwd })
      expect(responseAuth.body).toEqual(
        expect.objectContaining({ 'auth-token': expect.any(String) })
      )
    })

    it('Should not get user if password does not match', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
      }
      const responseCreate = await global.testRequest
        .post('/users')
        .send({ ...newUser, password: 'test123456' })

      const response = await global.testRequest
        .post('/auth')
        .send({ email: newUser.email, password: 'different password' })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        cause: 'UNAUTHORIZED',
        message: `Invalid password`,
      })
    })
  })
})
