declare namespace Express {
  export interface Request {
    user?: {
      id?: string
      sub?: string
      refreshToken?: string
      [key: string]: any
    }
  }
}
