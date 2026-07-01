const searchableFields = ['companyName', 'industry', 'city', 'position', 'note']

const matchesKeyword = (record, keyword) => {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) return true

  return searchableFields.some(field => {
    const value = record?.[field]
    return value && String(value).toLowerCase().includes(normalizedKeyword)
  })
}

export const filterRecords = (records, { keyword = '', resultFilters = [] } = {}) => {
  const selectedResults = Array.isArray(resultFilters) ? resultFilters : []

  return records.filter(record => {
    const matchesResult = selectedResults.length === 0 || selectedResults.includes(record?.result)
    return matchesResult && matchesKeyword(record, keyword)
  })
}

export const sortRecords = (records, sort = {}) => {
  const { prop, order } = sort
  const sorted = [...records]

  if (!prop || !order) return sorted

  return sorted.sort((a, b) => {
    const left = a?.[prop] || ''
    const right = b?.[prop] || ''
    const compareResult = String(left).localeCompare(String(right))
    return order === 'ascending' ? compareResult : -compareResult
  })
}

export const paginateRecords = (records, currentPage, pageSize) => {
  const start = (currentPage - 1) * pageSize
  return records.slice(start, start + pageSize)
}

export const filterSortAndPaginateRecords = (records, options = {}) => {
  const {
    keyword = '',
    resultFilters = [],
    sort = {},
    currentPage = 1,
    pageSize = 20
  } = options

  const filteredRecords = filterRecords(records, { keyword, resultFilters })
  const sortedRecords = sortRecords(filteredRecords, sort)

  return {
    filteredRecords,
    sortedRecords,
    records: paginateRecords(sortedRecords, currentPage, pageSize),
    total: filteredRecords.length
  }
}
