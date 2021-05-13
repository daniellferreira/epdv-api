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

  public async get(filter: UsersListFilter, id: string): Promise<User> {
    const user = await User.findOne({ ...filter, _id: id })

    if (!user) {
      throw new UserError(
        `Record not found with id: ${id}`,
        UserStatusCodes.NotFound,
        'RECORD_NOTFOUND'
      )
    }

    return user
  }

  public async getByEmail(email: string): Promise<User> {
    const user = await User.findOne({ email: email })

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
    s = '',
    limit = 10,
    page = 1,
    sort: SortObject | undefined
  ): Promise<PaginateResult<IUserDocument>> {
    if (sort && !(sort['name'] || sort['email'] || sort['createdAt'])) {
      sort = undefined
    }

    return User.paginate(
      User.find({
        ...filter,
        $or: [
          { name: { $regex: s, $options: 'i' } },
          { email: { $regex: s, $options: 'i' } },
        ],
      }),
      { limit, page, sort }
    )
  }

  public async edit(
    filter: UsersListFilter,
    id: string,
    data: any
  ): Promise<User> {
    const user = await User.findOne({ ...filter, _id: id })

    if (!user) {
      throw new UserError(
        `Record not found with id: ${id}`,
        UserStatusCodes.NotFound,
        'RECORD_NOTFOUND'
      )
    }

    Object.assign(user, data)

    return user.save()
  }
}
