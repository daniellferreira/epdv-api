import { UserError, UserStatusCodes } from '@src/util/errors'
import bcrypt from 'bcrypt'
import config from 'config'
import jwt from 'jsonwebtoken'
import { User } from '@src/models/user'

export interface DecodedUser extends Omit<User, '_id'> {
  id: string
}

export default class AuthService {
  public static async hashPassword(
    password: string,
    salt = 10
  ): Promise<string> {
    return await bcrypt.hash(password, salt)
  }

  public static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<void> {
    if (!(await bcrypt.compare(password, hashedPassword))) {
      throw new UserError(
        'Invalid password',
        UserStatusCodes.Unauthorized,
        'UNAUTHORIZED'
      )
    }
  }

  public static generateToken(payload: object): string {
    return jwt.sign(payload, config.get('App.auth.key'), {
      expiresIn: config.get('App.auth.tokenExpiresIn'),
    })
  }

  public static decodeToken(token: string): DecodedUser {
    return jwt.verify(token, config.get('App.auth.key')) as DecodedUser
  }
}
