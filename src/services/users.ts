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
    const user = await User.findOne({ email, active: true })

    if (!user) {
      throw new UserError(
        `Record not found or inative with email: ${email}`,
        UserStatusCodes.NotFound,
        'RECORD_NOTFOUND'
      )
    }

    return user
  }

  public list(
    filter: UsersListFilter,
    search: string,
    limit = 10,
    page = 1,
    sort: SortObject | undefined
  ): Promise<PaginateResult<IUserDocument>> {
    if (sort && !(sort['name'] || sort['email'] || sort['createdAt'])) {
      throw new UserError(
        `Sort field is invalid`,
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
    if (
      data.active === false ||
      data.active === 'false' ||
      (!data.scope?.includes('admin') && data.scope !== undefined)
    ) {
      const users_active = await User.find({
        account,
        active: true,
        scope: { $in: ['admin'] },
      })

      if (users_active.length <= 1 && users_active[0]._id == _id) {
        throw new UserError(
          `Unable to disable all administrators`,
          UserStatusCodes.Unauthorized,
          'UNAUTHORIZED'
        )
      }
    }
    const user = await User.findOne({ account, _id })

    Object.assign(user, data)

    return user.save()
  }
}
