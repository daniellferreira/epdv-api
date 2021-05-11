import mongoose, { Document, model, PaginateModel, Schema } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

export interface Product {
  readonly id?: string
  sku: string
  name: string
  images: string[]
  categories: string[]
  price: number
  active: boolean
  quantity: number
  description: string
  especifications: any
  account: string
}

export interface IProductDocument extends Omit<Product, 'id'>, Document {}
type IProductModel = PaginateModel<IProductDocument>

const schema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    name: { type: String, required: true },
    images: { type: [String], default: [] },
    active: { type: Boolean, default: true },
    categories: { type: [String], default: [] },
    oldPrice: { type: Number, min: 0.0, default: 0.0 },
    price: { type: Number, required: true, min: 0.0 },
    quantity: { type: Number, required: true, min: 0 },
    description: { type: String, default: null },
    especifications: { type: Schema.Types.Mixed, default: null }, // objeto contendo as especificacoes
    account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
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

schema.index({ account: 1, sku: 1 }, { unique: true })
schema.index({ account: 1 })
schema.index({ _id: 1, account: 1 })

schema.plugin(mongoosePaginate)

export const Product: IProductModel = model<IProductDocument, IProductModel>(
  'Product',
  schema
)
