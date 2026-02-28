'use client'

import React, { useState, useMemo, useCallback } from 'react'
import {
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconSelector,
  IconTrash,
  IconRefresh,
  IconFilter,
} from '@tabler/icons-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc'

export interface ColumnDef<T> {
  /** Unique key — also used for sorting if sortable */
  key: keyof T | string
  header: string
  /** Optional render override */
  cell?: (row: T, index: number) => React.ReactNode
  /** Enable column sorting */
  sortable?: boolean
  /** Column width class e.g. "w-[200px]" */
  width?: string
  /** Alignment */
  align?: 'left' | 'center' | 'right'
}

export interface DataTableFilter<T> {
  key: keyof T | string
  label: string
  options: { label: string; value: string }[]
}

export interface DataTableProps<T extends Record<string, unknown>> {
  /** Data rows */
  data: T[]
  /** Column definitions */
  columns: ColumnDef<T>[]
  /** Unique row key field */
  rowKey: keyof T
  /** Page size (default 10) */
  pageSize?: number
  /** Searchable fields */
  searchFields?: (keyof T)[]
  /** Search placeholder */
  searchPlaceholder?: string
  /** Dropdown filters */
  filters?: DataTableFilter<T>[]
  /** Enable row selection */
  selectable?: boolean
  /** Called with selected row keys when bulk delete triggered */
  onBulkDelete?: (keys: unknown[]) => void
  /** Called when edit icon clicked */
  onEdit?: (row: T) => void
  /** Called when delete icon clicked */
  onDelete?: (row: T) => void
  /** Extra toolbar slot (right side) */
  toolbarExtra?: React.ReactNode
  /** Empty state message */
  emptyMessage?: string
  /** Row click handler */
  onRowClick?: (row: T) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNestedValue<T>(row: T, key: string): unknown {
  return key.split('.').reduce<unknown>((obj, k) => {
    if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[k]
    return undefined
  }, row)
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDirection }) {
  if (!active) return <IconSelector size={13} className="text-muted-foreground/40" />
  return dir === 'asc' ? (
    <IconSortAscending size={13} className="text-primary" />
  ) : (
    <IconSortDescending size={13} className="text-primary" />
  )
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  rowKey,
  pageSize = 10,
  searchFields = [],
  searchPlaceholder = 'Cari...',
  filters = [],
  selectable = false,
  onBulkDelete,
  onEdit,
  onDelete,
  toolbarExtra,
  emptyMessage = 'Tidak ada data ditemukan.',
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(filters.map((f) => [String(f.key), '']))
  )
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>('asc')
  const [selectedKeys, setSelectedKeys] = useState<Set<unknown>>(new Set())
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<unknown>(null)

  // ── Active filter dropdowns ──
  const [openFilter, setOpenFilter] = useState<string | null>(null)

  const handleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortDir('asc')
      return key
    })
  }, [])

  const filtered = useMemo(() => {
    let result = [...data]

    // search
    if (search.trim() && searchFields.length > 0) {
      const q = search.toLowerCase()
      result = result.filter((row) =>
        searchFields.some((f) =>
          String(getNestedValue(row, String(f)) ?? '')
            .toLowerCase()
            .includes(q)
        )
      )
    }

    // filters
    filters.forEach((f) => {
      const val = filterValues[String(f.key)]
      if (val)
        result = result.filter((row) => String(getNestedValue(row, String(f.key)) ?? '') === val)
    })

    // sort
    if (sortKey) {
      result.sort((a, b) => {
        const av = getNestedValue(a, sortKey)
        const bv = getNestedValue(b, sortKey)
        let cmp = 0
        if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
        else cmp = String(av ?? '').localeCompare(String(bv ?? ''))
        return sortDir === 'asc' ? cmp : -cmp
      })
    }

    return result
  }, [data, search, searchFields, filterValues, filters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  // ── Selection ──
  const allPageSelected = paged.length > 0 && paged.every((r) => selectedKeys.has(r[rowKey]))
  const somePageSelected = paged.some((r) => selectedKeys.has(r[rowKey]))

  function toggleSelectAll() {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (allPageSelected) paged.forEach((r) => next.delete(r[rowKey]))
      else paged.forEach((r) => next.add(r[rowKey]))
      return next
    })
  }

  function toggleSelectRow(key: unknown) {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function handleBulkDelete() {
    onBulkDelete?.(Array.from(selectedKeys))
    setSelectedKeys(new Set())
  }

  function resetFilters() {
    setSearch('')
    setFilterValues(Object.fromEntries(filters.map((f) => [String(f.key), ''])))
    setPage(1)
  }

  const hasActiveFilters = search.trim() !== '' || Object.values(filterValues).some((v) => v !== '')

  // ── Pagination pages ──
  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
      if (
        idx > 0 &&
        typeof arr[idx - 1] === 'number' &&
        (p as number) - (arr[idx - 1] as number) > 1
      )
        acc.push('...')
      acc.push(p)
      return acc
    }, [])

  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2.5 p-3.5 border-b border-border flex-wrap bg-card">
        {/* Search */}
        {searchFields.length > 0 && (
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <IconSearch
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>
        )}

        {/* Dropdown Filters */}
        {filters.map((f) => (
          <div key={String(f.key)} className="relative">
            <button
              onClick={() =>
                setOpenFilter((prev) => (prev === String(f.key) ? null : String(f.key)))
              }
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
                filterValues[String(f.key)]
                  ? 'border-primary text-primary bg-primary/5 font-medium'
                  : 'border-input text-muted-foreground bg-background hover:border-border'
              }`}
            >
              <IconFilter size={13} />
              {filterValues[String(f.key)]
                ? (f.options.find((o) => o.value === filterValues[String(f.key)])?.label ?? f.label)
                : f.label}
              <IconChevronRight
                size={12}
                className={`transition-transform ${openFilter === String(f.key) ? 'rotate-90' : 'rotate-0'}`}
              />
            </button>
            {openFilter === String(f.key) && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpenFilter(null)} />
                <div className="absolute top-full mt-1 left-0 z-20 bg-popover border border-border rounded-xl shadow-xl overflow-hidden min-w-[140px]">
                  <button
                    onClick={() => {
                      setFilterValues((p) => ({ ...p, [String(f.key)]: '' }))
                      setOpenFilter(null)
                      setPage(1)
                    }}
                    className="w-full px-4 py-2.5 text-sm text-left text-muted-foreground hover:bg-accent transition-colors"
                  >
                    Semua {f.label}
                  </button>
                  {f.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilterValues((p) => ({ ...p, [String(f.key)]: opt.value }))
                        setOpenFilter(null)
                        setPage(1)
                      }}
                      className={`w-full px-4 py-2.5 text-sm text-left hover:bg-accent transition-colors ${
                        filterValues[String(f.key)] === opt.value
                          ? 'text-primary font-semibold bg-primary/5'
                          : 'text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            title="Reset filter"
            className="p-2 rounded-lg border border-input text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            <IconRefresh size={14} />
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bulk delete */}
        {selectable && selectedKeys.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-sm text-destructive border border-destructive/30 px-3 py-2 rounded-lg hover:bg-destructive/5 transition-colors font-medium"
          >
            <IconTrash size={14} />
            Hapus {selectedKeys.size}
          </button>
        )}

        {/* Extra toolbar */}
        {toolbarExtra}
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={allPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = somePageSelected && !allPageSelected
                    }}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 font-semibold text-muted-foreground text-xs tracking-wide uppercase ${alignClass[col.align ?? 'left']} ${col.width ?? ''}`}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(String(col.key))}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {col.header}
                      <SortIcon active={sortKey === String(col.key)} dir={sortDir} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center text-muted-foreground"
                >
                  <IconFilter size={36} className="mx-auto mb-3 opacity-25" />
                  <p className="font-medium text-sm">{emptyMessage}</p>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="mt-2 text-xs text-primary underline underline-offset-2"
                    >
                      Reset filter
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => {
                const key = row[rowKey]
                const isSelected = selectedKeys.has(key)
                return (
                  <tr
                    key={String(key)}
                    onClick={() => onRowClick?.(row)}
                    className={`border-b border-border/60 transition-colors
                      ${onRowClick ? 'cursor-pointer' : ''}
                      ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'}
                    `}
                  >
                    {selectable && (
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(key)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className={`px-4 py-3.5 text-foreground ${alignClass[col.align ?? 'left']}`}
                      >
                        {col.cell ? (
                          col.cell(row, idx)
                        ) : (
                          <span className="text-sm">
                            {String(getNestedValue(row, String(col.key)) ?? '-')}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer / Pagination ── */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card text-sm text-muted-foreground flex-wrap gap-2">
        <span>
          Menampilkan{' '}
          <span className="font-semibold text-foreground">
            {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
          </span>
          {' – '}
          <span className="font-semibold text-foreground">
            {Math.min(safePage * pageSize, filtered.length)}
          </span>
          {' dari '}
          <span className="font-semibold text-foreground">{filtered.length}</span>
        </span>

        <div className="flex items-center gap-1">
          <button
            disabled={safePage <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-1.5 rounded-lg border border-input disabled:opacity-40 hover:enabled:bg-accent transition-colors"
          >
            <IconChevronLeft size={14} />
          </button>

          {pageNums.map((p, i) =>
            p === '...' ? (
              <span key={`e${i}`} className="px-1.5 text-muted-foreground/60">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p as number)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  safePage === p
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-input text-foreground hover:bg-accent'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="p-1.5 rounded-lg border border-input disabled:opacity-40 hover:enabled:bg-accent transition-colors"
          >
            <IconChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
