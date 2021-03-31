import AuthService from '@src/services/auth'
import mongoose, { Document, Model } from 'mongoose'

export interface User {
  readonly id?: string
  name: string
  email: string
  password: string
}

interface UserModel extends Omit<User, 'id'>, Document {}

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

Schema.index({ email: 1 }, { unique: true })

Schema.pre<UserModel>('save', async function (): Promise<void> {
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

export const User: Model<UserModel> = mongoose.model('User', Schema)
