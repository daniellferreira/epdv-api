import dotenv from 'dotenv'
dotenv.config()

import { SetupServer } from './server'

import { config } from '@src/services/config'
;(async (): Promise<void> => {
  const server = new SetupServer(config.port)
  await server.init()
  server.start()
})()
