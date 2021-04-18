import config from '@src/services/config'
import mongoose, { Mongoose } from 'mongoose'

export const connect = async (): Promise<Mongoose> => {
  mongoose.set('debug', process.env.NODE_ENV === 'dev')
  return await mongoose.connect(config.db.connectionString, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}

export const close = (): Promise<void> => mongoose.connection.close()
