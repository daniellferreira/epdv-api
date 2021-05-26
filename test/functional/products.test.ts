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
    const responseProduct1 = await global.testRequest
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
})
