import mongoose, { Document, Model, model } from 'mongoose'
//import mongoTenant from 'mongo-tenant'

export interface Account {
  tenantId: number
  id?: string
}

interface IAccountDocument extends Omit<Account, 'id'>, Document {}
interface IAccountModel extends Model<IAccountDocument> {}

const Schema = new mongoose.Schema(
  {
    tenantId: { type: Number, required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
      },
    },
    timestamps: true,
  }
)

Schema.index({ tenantId: 1 }, { unique: true })

export const Account: IAccountModel = model<IAccountDocument, IAccountModel>(
  'Account',
  Schema
)
