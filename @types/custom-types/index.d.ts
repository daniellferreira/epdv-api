import * as http from 'http'
import { DecodedUser } from 'lib/auth'

// module augmentation
declare module 'express-serve-static-core' {
  export interface Request extends http.IncomingMessage, Express.Request {
    decoded?: DecodedUser
  }
}
