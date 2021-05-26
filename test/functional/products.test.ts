import { Account } from '@src/models/account'
import { Product } from '@src/models/product'
import { User } from '@src/models/user'
import { Types } from 'mongoose'

describe('Products functional tests', () => {
  let token: string
  let newProduct: Partial<Product>

  beforeEach(async () => {
    await User.deleteMany()
    await Account.deleteMany()
    await Product.deleteMany()

    const newAccount = {
      email: 'AccountTest@mail.com',
      password: 'test123456',
    }

    await global.testRequest
      .post('/accounts')
      .send({ ...newAccount, name: 'Account Test' })

    const responseToken = await global.testRequest
      .post('/auth/token')
      .send(newAccount)

    token = responseToken.body['auth-token']
    newProduct = {
      sku: 'CELSS8B128',
      name: 'Samsung Galaxy S8 Branco',
      images: [
        'https://images-americanas.b2w.io/produtos/01/00/img/2137539/6/2137539613_1GG.jpg',
      ],
      price: 2299.99,
      quantity: 100,
    }
  })

  describe('When creating new product', () => {
    it('should create a single product', async () => {
      const response = await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token,
        })
        .send(newProduct)
      expect(response.status).toBe(201)
      expect(response.body).toEqual(expect.objectContaining(newProduct))
    })

    it('should not create a single product without token', async () => {
      const response = await global.testRequest
        .post('/products')
        .send(newProduct)

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        cause: 'UNAUTHORIZED',
        message: 'jwt must be provided',
      })
    })

    it('should not create a product with duplicated sku in one account', async () => {
      await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token,
        })
        .send(newProduct)

      const response = await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token,
        })
        .send(newProduct)

      expect(response.status).toBe(422)
      expect(response.body).toStrictEqual({
        message: 'There are validation errors',
        cause: 'VALIDATION_ERROR',
        errors: {
          account: 'There is already a record with the same value',
          sku: 'There is already a record with the same value',
        },
      })
    })

    it('should create a product with same sku in different accounts', async () => {
      await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token,
        })
        .send(newProduct)

      const newAccount2 = {
        email: 'AccountTest+2@mail.com',
        password: 'test123456',
      }
      await global.testRequest
        .post('/accounts')
        .send({ ...newAccount2, name: 'Account Test' })
      const responseToken = await global.testRequest
        .post('/auth/token')
        .send(newAccount2)
      const token2 = responseToken.body['auth-token']

      const responseProduct2 = await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token2,
        })
        .send(newProduct)

      expect(responseProduct2.status).toBe(201)
      expect(responseProduct2.body).toEqual(expect.objectContaining(newProduct))
    })
  })

  describe('When geting new product', () => {
    it('should get a created product', async () => {
      const responseCreate = await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token,
        })
        .send(newProduct)

      const responseGet = await global.testRequest
        .get('/products/' + responseCreate.body.id)
        .set({
          'x-access-token': token,
        })
        .send()

      expect(responseGet.status).toBe(200)
      expect(responseGet.body).toStrictEqual(responseCreate.body)
    })

    it('should not get a invalid product', async () => {
      const id = new Types.ObjectId().toHexString()

      const response = await global.testRequest
        .get('/products/' + id)
        .set({
          'x-access-token': token,
        })
        .send()

      expect(response.status).toBe(404)
      expect(response.body).toStrictEqual({
        message: 'Record not found with id: ' + id,
        cause: 'RECORD_NOTFOUND',
      })
    })

    it('should not get a created product without token', async () => {
      const responseCreate = await global.testRequest
        .post('/products')
        .send(newProduct)

      const responseGet = await global.testRequest
        .get('/products/' + responseCreate.body.id)
        .set({
          'x-access-token': token,
        })
        .send()

      expect(responseCreate.status).toBe(401)
      expect(responseCreate.body).toEqual({
        cause: 'UNAUTHORIZED',
        message: 'jwt must be provided',
      })
    })
  })

  describe('When editing the products', () => {
    it('should edit a created product', async () => {
      const responseCreate = await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token,
        })
        .send(newProduct)

      const responseEdit = await global.testRequest
        .put(`/products/${responseCreate.body.id}`)
        .set({
          'x-access-token': token,
        })
        .send({ name: 'Zenfone 3' })

      expect(responseEdit.status).toBe(200)
      expect(responseEdit.body).toStrictEqual({
        ...responseCreate.body,
        name: 'Zenfone 3',
        updatedAt: responseEdit.body.updatedAt,
      })
    })

    it('should not edit invalid product', async () => {
      const responseEdit = await global.testRequest
        .put(`/products/123`)
        .set({
          'x-access-token': token,
        })
        .send({ name: 'Zenfone 3' })

      expect(responseEdit.status).toBe(404)
      expect(responseEdit.body).toEqual({
        cause: 'RECORD_NOTFOUND',
        message: `Record not found with id: 123`,
      })
    })

    it('should not edit a created product without token', async () => {
      const responseCreate = await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token,
        })
        .send(newProduct)

      const responseEdit = await global.testRequest
        .put(`/products/${responseCreate.body.id}`)
        .send({ name: 'Zenfone 3' })

      expect(responseEdit.status).toBe(401)
      expect(responseEdit.body).toEqual({
        cause: 'UNAUTHORIZED',
        message: 'jwt must be provided',
      })
    })
  })

  describe('When listing products', () => {
    it('should list all created products', async () => {
      const newProduct2 = {
        sku: 'CELSS8B128-2',
        name: 'Samsung Galaxy S8 Branco-2',
        images: [
          'https://images-americanas.b2w.io/produtos/01/00/img/2137539/6/2137539613_1GG.jpg',
        ],
        price: 1234.2,
        quantity: 123,
      }

      const responseCreate = await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token,
        })
        .send(newProduct)

      const responseCreate2 = await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token,
        })
        .send(newProduct2)

      const responseList = await global.testRequest
        .get('/products')
        .set({
          'x-access-token': token,
        })
        .send()

      expect(responseList.status).toBe(200)
      expect(responseList.body).toEqual({
        docs: [responseCreate.body, responseCreate2.body],
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

    it('should not list created products without token', async () => {
      const response = await global.testRequest.get('/products').send()

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        cause: 'UNAUTHORIZED',
        message: 'jwt must be provided',
      })
    })

    it('should not list created products with invalid filter', async () => {
      const responseList = await global.testRequest
        .get('/products/?active=abc&limit=1&page=1&sort=name,asc')
        .set({
          'x-access-token': token,
        })
        .send()

      expect(responseList.status).toBe(404)
      expect(responseList.body).toEqual({
        cause: 'RECORD_NOTFOUND',
        message: 'Record not found with active: abc',
      })
    })

    it('should not find created products from another account', async () => {
      const responseCreate = await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token,
        })
        .send(newProduct)

      const newAccount2 = {
        email: 'AccountTest+2@mail.com',
        password: 'test123456',
      }
      await global.testRequest
        .post('/accounts')
        .send({ ...newAccount2, name: 'Account Test' })
      const responseToken = await global.testRequest
        .post('/auth/token')
        .send(newAccount2)
      const token2 = responseToken.body['auth-token']

      await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token2,
        })
        .send(newProduct)

      const responseList = await global.testRequest
        .get('/products')
        .set({
          'x-access-token': token,
        })
        .send()

      expect(responseList.status).toBe(200)
      expect(responseList.body).toEqual({
        docs: [responseCreate.body],
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        nextPage: null,
        page: 1,
        pagingCounter: 1,
        prevPage: null,
        totalDocs: 1,
        totalPages: 1,
      })
    })

    it('should find three created produtcs, separete them into two pages and sort name,asc', async () => {
      const newProduct2 = {
        sku: 'CELSS8B128-3',
        name: '1Samsung Galaxy S8 Branco-3',
        images: [
          'https://images-americanas.b2w.io/produtos/01/00/img/2137539/6/2137539613_1GG.jpg',
        ],
        price: 1234.2,
        quantity: 123,
      }

      const newProduct3 = {
        sku: 'CELSS8B128-2',
        name: 'Samsung Galaxy S8 Branco-2',
        images: [
          'https://images-americanas.b2w.io/produtos/01/00/img/2137539/6/2137539613_1GG.jpg',
        ],
        price: 4321.2,
        quantity: 321,
      }

      const responseCreate = await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token,
        })
        .send(newProduct)

      const responseCreate2 = await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token,
        })
        .send(newProduct2)

      await global.testRequest
        .post('/products')
        .set({
          'x-access-token': token,
        })
        .send(newProduct3)

      const responseList = await global.testRequest
        .get('/products/?active=true&limit=1&page=1&sort=name,asc')
        .set({
          'x-access-token': token,
        })
        .send()

      expect(responseList.status).toBe(200)
      expect(responseList.body).toEqual({
        docs: [responseCreate2.body],
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
})
