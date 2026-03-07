import { useState } from 'react'
import toast from 'react-hot-toast'
import FileDropzone from './FileDropzone'
import useApi from '../hooks/useApi'

type InfoResponse = { pages: number; size_bytes: number; title: string; author: string }

export default function SplitTool() {
  const [file, setFile] = useState<File | null>(null)
  const [ranges, setRanges] = useState('')
  const { data: info, request: requestInfo } = useApi<InfoResponse>()
  const { loading, request } = useApi()

  const handleFiles = async (incoming: File[]) => {
    if (!incoming.length) return
    const f = incoming[0]
    setFile(f)
    setRanges('')
    const body = new FormData()
    body.append('file', f)
    try {
      await requestInfo('/info', { body })
    } catch {
      toast.error('Failed to load file info')
    }
  }

  const handleSplit = () => {
    if (!file || !ranges.trim()) return
    const body = new FormData()
    body.append('file', file)
    body.append('ranges', ranges.trim())
    const isMultiple = ranges.split(',').filter(p => p.trim()).length > 1
    const filename = isMultiple ? 'split.zip' : 'split.pdf'
    toast.promise(
      request('/split', { body, download: true, filename }),
      { loading: 'Splitting…', success: 'Done!', error: (err) => err?.message ?? 'Something went wrong' },
    )
  }

  return (
    <div className="mx-auto max-w-xl p-8">
      <h2 className="mb-6 text-2xl font-bold">Split PDF</h2>

      <FileDropzone onFiles={handleFiles} />

      {file && (
        <p className="mt-3 text-sm text-base-content/60">
          {file.name}{info ? ` — ${info.pages} pages` : ''}
        </p>
      )}

      {file && (
        <div className="mt-4">
          <label className="label">
            <span className="label-text">Pages or ranges</span>
            {info && <span className="label-text-alt text-base-content/50">1–{info.pages}</span>}
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="e.g. 1, 3-5, 7"
            value={ranges}
            onChange={e => setRanges(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSplit()}
          />
        </div>
      )}

      <button
        className="btn btn-primary mt-6 w-full"
        disabled={!file || !ranges.trim() || loading}
        onClick={handleSplit}
      >
        {loading ? <span className="loading loading-spinner loading-sm" /> : 'Split'}
      </button>
    </div>
  )
}
