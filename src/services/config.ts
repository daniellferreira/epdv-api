interface Config {
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
  port: parseInt(process.env.PORT as string),
  db: {
    connectionString:
      (process.env.DB_CONNECTIONSTRING as string) ||
      'mongodb://localhost:27017/epdv-local',
  },
  auth: {
    key: process.env.AUTH_KEY as string,
    tokenExpiresIn: process.env.AUTH_TOKENEXPIRATION as string,
  },
}

export default config
