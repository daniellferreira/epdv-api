import { User } from '@src/models/user'
import { UserError, UserStatusCodes } from '@src/util/errors'

export class UsersService {
  public create(data: User): Promise<User> {
    const user = new User(data)
    return user.save()
  }

  public async get(id: string): Promise<User> {
    // const user = await User.byTenant('1').findById(id)
    const user = await User.findById(id)

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

  public async search(name: string, email: string): Promise<User[]> {
    const user = await User.find({
      name: { $regex: name, $options: 'i' },
      email: { $regex: email, $options: 'i' },
    })

    return user
  }

  public list(): Promise<User[]> {
    return User.find()
  }

  // eslint-disable-next-line
  public async edit(id: string, data: any): Promise<User> {
    const user = await User.findById(id)

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
