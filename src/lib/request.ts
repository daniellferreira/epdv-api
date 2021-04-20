import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

export interface RequestConfig extends AxiosRequestConfig {}
export interface Response<T = any> extends AxiosResponse {}

export class Request {
  constructor(
    private request = axios.create({ headers: { 'User-Agent': 'epdv-api' } })
  ) {}

  public get<T>(url: string, config: RequestConfig = {}): Promise<Response<T>> {
    return this.request.get<T, Response<T>>(url, config)
  }
}
