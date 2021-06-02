import { Account } from '@src/models/account'
import { User } from '@src/models/user'
import { AccountService } from '@src/services/accounts'

describe('Auth unit tests', () => {
  beforeEach(async () => {
    await User.deleteMany()
    await Account.deleteMany()
  })

  it('should create an account and get the last one created', async () => {
    const accountService = new AccountService()
    await accountService.create({ tenantId: 1 })
    const createdService2 = await accountService.create({ tenantId: 99 })

    const getLastAccountCreated = await accountService.getLast()

    expect(getLastAccountCreated[0].tenantId).toEqual(createdService2.tenantId)
  })
})
