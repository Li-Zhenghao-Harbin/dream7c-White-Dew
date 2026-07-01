import assert from 'node:assert/strict'
import test from 'node:test'
import { filterSortAndPaginateRecords } from '../src/utils/recordsPagination.mjs'

const makeRecord = (id, result, applyDate) => ({
  id,
  result,
  applyDate,
  companyName: `company-${id}`
})

test('filters records before pagination', () => {
  const records = Array.from({ length: 24 }, (_, index) => {
    const id = index + 1
    return makeRecord(id, id <= 15 ? '进行中' : '简历挂', `2026-01-${String(id).padStart(2, '0')}`)
  })

  const firstPage = filterSortAndPaginateRecords(records, {
    keyword: '',
    resultFilters: ['进行中'],
    sort: { prop: 'applyDate', order: 'ascending' },
    currentPage: 1,
    pageSize: 20
  })

  const secondPage = filterSortAndPaginateRecords(records, {
    keyword: '',
    resultFilters: ['进行中'],
    sort: { prop: 'applyDate', order: 'ascending' },
    currentPage: 2,
    pageSize: 20
  })

  assert.equal(firstPage.total, 15)
  assert.equal(firstPage.records.length, 15)
  assert.deepEqual(firstPage.records.map(record => record.id), Array.from({ length: 15 }, (_, index) => index + 1))
  assert.equal(secondPage.records.length, 0)
})
