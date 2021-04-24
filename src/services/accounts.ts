import { Account } from '@src/models/account'

export class AccountService {
  public create(data: Account): Promise<Account> {
    const account = new Account(data)
    return account.save()
  }

  public list(): Promise<Account[]> {
    return Account.find()
  }

  public getLast(): Promise<Account[]> {
    return Account.find().sort({ tenantId: -1 }).limit(1)
  }
}
