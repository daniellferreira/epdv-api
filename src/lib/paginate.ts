export interface ReqListQuery {
  s: string
  page: number
  limit: number
  sort: string
  active: boolean
}

export interface SortObject {
  [key: string]: 'asc' | 'desc'
}

export function stringToSort(sort: string): SortObject | undefined {
  if (!sort) {
    return
  }

  const sortObj: SortObject = {}
  const fields = sort.split(';')

  for (const fieldSort of fields) {
    const [field, way = 'asc'] = fieldSort.split(',')

    if (way === 'asc' || way === 'desc') {
      sortObj[field] = way
    }
  }

  return sortObj
}
