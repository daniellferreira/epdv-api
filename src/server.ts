import fs from 'fs'
import { Server } from '@overnightjs/core'
import bodyParser from 'body-parser'
import { Application, static as staticExpress } from 'express'
import './util/module-alias'
import * as database from '@src/util/database'
import { Server as HttpServer } from 'http'
import { ErrorHandler } from '@src/lib/errorHandler'

export class SetupServer extends Server {
  private server!: HttpServer

  constructor(private port = 3000) {
    super(process.env.NODE_ENV === 'dev')
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json())
  }

  private async setupControllers(): Promise<void> {
    let controllers: string[] = fs.readdirSync('./src/controllers')

    controllers = controllers
      .filter((ctr) => !ctr.startsWith('__') && ctr.endsWith('.ts'))
      .map((ctr) => ctr.replace('.ts', ''))

    for (const controller of controllers) {
      const controllerFile = await import(`@src/controllers/${controller}`)

      Object.keys(controllerFile)
        .filter((elem) => elem.includes('Controller'))
        .forEach((controllerName) => {
          this.addControllers(new controllerFile[controllerName]())
        })
    }
  }

  private async setupDatabase(): Promise<void> {
    await database.connect()
  }

  private setupDoc(): void {
    this.app.use(staticExpress(__dirname + '/docs'))
  }

  public async init(): Promise<void> {
    this.setupExpress()
    await this.setupControllers()
    await this.setupDatabase()
    this.setupDoc()
  }

  public start(): void {
    this.app.use(ErrorHandler)
    this.server = this.app.listen(this.port, () => {
      console.info(`Server running on PID ${process.pid} port ${this.port}`)
    })
  }

  public async close(): Promise<void> {
    await database.close()
    this.server.close()
  }

  public getApp(): Application {
    return this.app
  }
}
