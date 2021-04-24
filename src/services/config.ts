export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

interface Config {
  environment: Environment
  port: number
  db: {
    connectionString: string
  }
  auth: {
    key: string
    tokenExpiresIn: string
  }
}

const config: Config = {
  environment: process.env.NODE_ENV as Environment,
  port: parseInt(process.env.PORT as string),
  db: {
    connectionString: process.env.DB_CONNECTIONSTRING as string,
  },
  auth: {
    key: process.env.AUTH_KEY as string,
    tokenExpiresIn: process.env.AUTH_TOKENEXPIRATION as string,
  },
}

export { config }
