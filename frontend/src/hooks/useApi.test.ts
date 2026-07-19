import { renderHook, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import useApi from './useApi'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('useApi', () => {
  it('returns JSON data on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ pages: 3 }),
    }))

    const { result } = renderHook(() => useApi<{ pages: number }>())
    let returned: unknown
    await act(async () => {
      returned = await result.current.request('/info', { body: new FormData() })
    })

    expect(returned).toEqual({ pages: 3 })
    expect(result.current.data).toEqual({ pages: 3 })
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('parses the detail field from an error response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ detail: 'Invalid or corrupted PDF' }),
    }))

    const { result } = renderHook(() => useApi())
    await act(async () => {
      await result.current.request('/merge', { body: new FormData() })
    })

    expect(result.current.error).toBe('Invalid or corrupted PDF')
    expect(result.current.data).toBeNull()
  })

  it('triggers a download and leaves data null for download responses', async () => {
    const blob = new Blob(['%PDF'])
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => blob,
    }))
    const createObjectURL = vi.fn(() => 'blob:mock')
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    const { result } = renderHook(() => useApi())
    await act(async () => {
      await result.current.request('/merge', {
        body: new FormData(),
        download: true,
        filename: 'out.pdf',
      })
    })

    expect(click).toHaveBeenCalledOnce()
    expect(createObjectURL).toHaveBeenCalledWith(blob)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
