import AuthService from '@src/lib/auth'
import mongoose, { Document, Model, model } from 'mongoose'
import mongoTenant from 'mongo-tenant'

export interface User {
  readonly id?: string
  name: string
  email: string
  password: string
}

interface IUserDocument extends Omit<User, 'id'>, Document {}
interface IUserModel extends Model<IUserDocument> {
  byTenant(tenantId: string): IUserModel
}

const Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.password
      },
    },
    timestamps: true,
  }
)

Schema.index({ email: 1 }, { unique: true, preserveUniqueKey: true })

Schema.plugin(mongoTenant)

Schema.pre<IUserDocument>('save', async function (): Promise<void> {
  if (!this.password || !this.isModified('password')) {
    return
  }

  try {
    const hashedPassword = await AuthService.hashPassword(this.password)
    this.password = hashedPassword
  } catch (err) {
    console.error(`Error hashing the password for the user ${this.name}`)
  }
})

export const User: IUserModel = model<IUserDocument, IUserModel>('User', Schema)
