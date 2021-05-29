import { stringToSort } from '@src/lib/paginate'

describe('Paginate unit tests', () => {
  it('should return name,asc', () => {
    const paginate = stringToSort('name,asc')
    console.log(paginate)
    expect(paginate).toMatchObject({ name: 'asc' })
  })

  it('should return name,desc', () => {
    const paginate = stringToSort('name,desc')
    console.log(paginate)
    expect(paginate).toMatchObject({ name: 'desc' })
  })

  it('should complet sort with asc', () => {
    const paginate = stringToSort('abc')
    console.log(paginate)
    expect(paginate).toMatchObject({ abc: 'asc' })
  })

  it('should return {} when invalid way', () => {
    const paginate = stringToSort('name,abc')
    console.log(paginate)
    expect(paginate).toMatchObject({})
  })

  it('should return undefined when no sort', () => {
    const paginate = stringToSort('')
    console.log(paginate)
    expect(paginate).toBe(undefined)
  })
})
