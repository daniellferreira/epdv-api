import { Account } from '@src/models/account'
import { User } from '@src/models/user'
import { AccountService } from '@src/services/accounts'
import { UsersService } from '@src/services/users'

describe('Auth unit tests', () => {
  const userService = new UsersService()
  const accountService = new AccountService()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userTest: any

  beforeEach(async () => {
    await User.deleteMany()
    await Account.deleteMany()
    const accountServiceCreated = await accountService.create({ tenantId: 1 })
    userTest = await userService.create({
      name: 'admin',
      scope: 'admin',
      email: 'admin@email.com',
      active: true,
      password: 'admin',
      isAdmin: true,
      account: accountServiceCreated.id as string,
    })
  })

  it('should create an user and validate the creation', async () => {
    const createdUserService = await userService.get(
      userTest.account,
      userTest.id as string
    )

    expect(createdUserService.id).toEqual(userTest.id)
  })

  it('should get the user by the email informed', async () => {
    const createdUserService = await userService.getByEmail(userTest.email)

    expect(createdUserService.id).toEqual(userTest.id)
  })

  it('should list the users created', async () => {
    await userService.create({
      name: 'admin2',
      scope: 'admin',
      email: 'admin2@email.com',
      active: true,
      password: 'admin',
      isAdmin: true,
      account: userTest.account,
    })

    const createdListService = await userService.list(
      { account: userTest.account },
      '',
      10,
      1,
      undefined
    )
    expect(createdListService.docs).toHaveLength(2)
  })

  it('should edit the user informations', async () => {
    const createdUserService = await userService.edit(
      userTest.account,
      userTest.id as string,
      { name: 'James' }
    )

    expect(createdUserService.id).toEqual(userTest.id)
    expect(createdUserService.name).toEqual('James')
  })
})
