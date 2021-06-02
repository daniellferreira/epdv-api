import { Account } from '@src/models/account'
import { User } from '@src/models/user'
import { AccountService } from '@src/services/accounts'
import { ProductsService } from '@src/services/products'
import { UsersService } from '@src/services/users'

describe('Auth unit tests', () => {
  const userService = new UsersService()
  const accountService = new AccountService()
  const productService = new ProductsService()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userTestGet: any

  beforeEach(async () => {
    await User.deleteMany()
    await Account.deleteMany()
    const accountServiceCreated = await accountService.create({ tenantId: 1 })
    userTestGet = await userService.create({
      name: 'admin',
      scope: 'admin',
      email: 'admin@email.com',
      active: true,
      password: 'admin',
      isAdmin: true,
      account: accountServiceCreated.id as string,
    })
  })

  it('should create an user to allocate products to', async () => {
    const createdProductService = await productService.create({
      sku: 'skuString',
      name: 'Celular',
      price: 1200.34,
      quantity: 20,
      account: userTestGet.account,
      currency: 'BRL',
    })

    const getProductService = await productService.get(
      userTestGet.account,
      createdProductService.id as string
    )

    expect(createdProductService.id).toEqual(getProductService.id)
  })

  it('should list the products created', async () => {
    await productService.create({
      sku: 'skuString123',
      name: 'telefone',
      price: 1200.34,
      quantity: 15,
      account: userTestGet.account,
      currency: 'BRL',
    })

    await productService.create({
      sku: 'skuString21313',
      name: 'computador',
      price: 5000.34,
      quantity: 10,
      account: userTestGet.account,
      currency: 'BRL',
    })

    const createdListService = await productService.list(
      { account: userTestGet.account },
      10,
      1,
      undefined
    )
    expect(createdListService.docs).toHaveLength(2)
  })

  it('should edit the product informations', async () => {
    const testProductCreated = await productService.create({
      sku: 'skuString213131',
      name: 'PC',
      price: 10000.34,
      quantity: 1,
      account: userTestGet.account,
      currency: 'BRL',
    })

    const createdProductService = await productService.edit(
      userTestGet.account,
      testProductCreated.id as string,
      { name: 'Personal Computer' }
    )

    expect(createdProductService.id).toEqual(testProductCreated.id)
    expect(createdProductService.name).toEqual('Personal Computer')
  })
})
