"use client"

import { useState, useEffect, useCallback } from "react"
import { OptimizationUtils } from "@/lib/content-optimization"

// Хук для оптимизированного поиска
export function useOptimizedSearch<T>(searchFn: (query: string) => Promise<T[]>, debounceMs = 300) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const debouncedSearch = useCallback(
    OptimizationUtils.debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const searchResults = await searchFn(searchQuery)
        setResults(searchResults)
      } catch (err) {
        setError(err as Error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, debounceMs),
    [searchFn, debounceMs],
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults: () => setResults([]),
  }
}

// Хук для пагинации с оптимизацией
export function useOptimizedPagination<T>(
  fetchFn: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  limit = 10,
) {
  const [currentPage, setCurrentPage] = useState(1)
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadPage = useCallback(
    async (page: number) => {
      setLoading(true)
      setError(null)

      try {
        const result = await fetchFn(page, limit)
        setData(result.data)
        setTotal(result.total)
        setCurrentPage(page)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    },
    [fetchFn, limit],
  )

  useEffect(() => {
    loadPage(1)
  }, [loadPage])

  const totalPages = Math.ceil(total / limit)

  return {
    data,
    currentPage,
    totalPages,
    total,
    loading,
    error,
    goToPage: loadPage,
    nextPage: () => currentPage < totalPages && loadPage(currentPage + 1),
    prevPage: () => currentPage > 1 && loadPage(currentPage - 1),
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  }
}

// Хук для бесконечной прокрутки
export function useInfiniteScroll<T>(
  fetchFn: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean }>,
  limit = 10,
) {
  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFn(page, limit)
      setData((prev) => [...prev, ...result.data])
      setHasMore(result.hasMore)
      setPage((prev) => prev + 1)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, page, limit, loading, hasMore])

  useEffect(() => {
    loadMore()
  }, []) // Загружаем первую страницу

  const reset = useCallback(() => {
    setData([])
    setPage(1)
    setHasMore(true)
    setError(null)
  }, [])

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
  }
}
