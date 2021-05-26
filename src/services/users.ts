import { IUserDocument, User } from '@src/models/user'
import { UserError, UserStatusCodes } from '@src/util/errors'
import { PaginateResult } from 'mongoose'
import { SortObject } from '@src/lib/paginate'

export interface UsersListFilter {
  account: string
  active?: boolean
}

export class UsersService {
  public create(data: User): Promise<User> {
    const user = new User(data)
    return user.save()
  }

  public async get(account: string, _id: string): Promise<User> {
    const user = await User.findOne({ account, _id })

    if (!user) {
      throw new UserError(
        `Record not found with id: ${_id}`,
        UserStatusCodes.NotFound,
        'RECORD_NOTFOUND'
      )
    }

    return user
  }

  public async getByEmail(email: string): Promise<User> {
    const user = await User.findOne({ email })

    if (!user) {
      throw new UserError(
        `Record not found with email: ${email}`,
        UserStatusCodes.NotFound,
        'RECORD_NOTFOUND'
      )
    }

    return user
  }

  public async list(
    filter: UsersListFilter,
    search: string,
    limit = 10,
    page = 1,
    sort: SortObject | undefined
  ): Promise<PaginateResult<IUserDocument>> {
    if (sort && !(sort['name'] || sort['email'] || sort['createdAt'])) {
      throw new UserError(
        `Record not found with sort`,
        UserStatusCodes.NotFound,
        'RECORD_NOTFOUND'
      )
    }

    const query: any = { ...filter }

    if (search) {
      query['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    return User.paginate(query, { limit, page, sort })
  }

  // eslint-disable-next-line
  public async edit(account: string, _id: string, data: any): Promise<User> {
    const user = await User.findOne({ account, _id })

    Object.assign(user, data)

    return user.save()
  }
}
