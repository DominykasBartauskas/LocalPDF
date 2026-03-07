import { useState, useCallback } from 'react'

type ApiState<T> = {
  data: T | null
  loading: boolean
  error: string | null
}

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: FormData | Record<string, unknown>
  download?: boolean
  filename?: string
}

function useApi<T = unknown>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const request = useCallback(async (endpoint: string, options: RequestOptions = {}) => {
    const { method = 'POST', body, download = false, filename = 'download.pdf' } = options

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const fetchOptions: RequestInit = { method }

      if (body instanceof FormData) {
        fetchOptions.body = body
      } else if (body) {
        fetchOptions.headers = { 'Content-Type': 'application/json' }
        fetchOptions.body = JSON.stringify(body)
      }

      const response = await fetch(`/api${endpoint}`, fetchOptions)

      if (!response.ok) {
        const text = await response.text()
        let message: string
        try {
          const detail = JSON.parse(text)?.detail
          if (typeof detail === 'string') {
            message = detail
          } else if (detail != null) {
            message = JSON.stringify(detail)
          } else {
            message = text
          }
        } catch {
          message = text
        }
        throw new Error(message || `Request failed with status ${response.status}`)
      }

      if (download) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 100)
        setState({ data: null, loading: false, error: null })
        return
      }

      const data = (await response.json()) as T
      setState({ data, loading: false, error: null })
      return data
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An unexpected error occurred'
      setState(prev => ({ ...prev, loading: false, error }))
    }
  }, [])

  return { ...state, request }
}

export default useApi
