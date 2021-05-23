import { SetupServer } from '@src/server'
import supertest from 'supertest'

let server: SetupServer

beforeAll(async () => {
  server = new SetupServer()
  await server.init()
  server.start()
  global.testRequest = supertest(server.getApp())
})

afterAll(async () => await server.close())
