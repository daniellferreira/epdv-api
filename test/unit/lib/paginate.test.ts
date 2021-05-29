import { stringToSort } from '@src/lib/paginate'

describe('Paginate unit tests', () => {
  it('should return name,asc', () => {
    const paginate = stringToSort('name,asc')

    expect(paginate).toMatchObject({ name: 'asc' })
  })

  it('should return name,desc', () => {
    const paginate = stringToSort('name,desc')

    expect(paginate).toMatchObject({ name: 'desc' })
  })

  it('should complet sort with asc', () => {
    const paginate = stringToSort('abc')

    expect(paginate).toMatchObject({ abc: 'asc' })
  })

  it('should return {} when invalid way', () => {
    const paginate = stringToSort('name,abc')

    expect(paginate).toMatchObject({})
  })

  it('should return undefined when no sort', () => {
    const paginate = stringToSort('')

    expect(paginate).toBe(undefined)
  })
})
