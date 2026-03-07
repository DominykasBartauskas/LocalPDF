import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import FileDropzone from './FileDropzone'
import ToolLayout from './ToolLayout'
import useApi from '../hooks/useApi'

type InfoResponse = { pages: number; size_bytes: number; title: string; author: string }

export default function SplitTool() {
  const [file, setFile] = useState<File | null>(null)
  const [ranges, setRanges] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [splitCount, setSplitCount] = useState(0)
  const { data: info, request: requestInfo } = useApi<InfoResponse>()
  const { loading, error, request } = useApi()

  const showResult = submitted && !loading
  const isSuccess = showResult && !error
  const isError = showResult && !!error

  const handleFiles = async (incoming: File[]) => {
    if (!incoming.length) return
    const f = incoming[0]
    setFile(f)
    setRanges('')
    setSubmitted(false)
    const body = new FormData()
    body.append('file', f)
    try {
      await requestInfo('/info', { body })
    } catch {
      toast.error('Failed to load file info')
    }
  }

  const handleSplit = async () => {
    if (!file || !ranges.trim()) return
    const count = ranges.split(',').filter(p => p.trim()).length
    setSplitCount(count)
    const body = new FormData()
    body.append('file', file)
    body.append('ranges', ranges.trim())
    const isMultiple = count > 1
    const filename = isMultiple ? 'split.zip' : 'split.pdf'
    setSubmitted(false)
    try {
      await request('/split', { body, download: true, filename })
    } finally {
      setSubmitted(true)
    }
  }

  const reset = () => {
    setFile(null)
    setRanges('')
    setSubmitted(false)
  }

  const sidebar = (
    <>
      {file && (
        <p className="mb-4 text-sm text-base-content/60">
          {file.name}{info ? ` — ${info.pages} pages` : ''}
        </p>
      )}

      {file && (
        <div className="mb-6">
          <label className="label">
            <span className="label-text">Pages or ranges</span>
            {info && <span className="label-text-alt text-base-content/50">1–{info.pages}</span>}
          </label>
          <input
            type="text"
            className="input input-bordered w-full bg-base-100 text-base-content"
            placeholder="e.g. 1, 3-5, 7"
            value={ranges}
            onChange={e => { setRanges(e.target.value); setSubmitted(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSplit()}
          />
        </div>
      )}

      {!isSuccess && (
        <button
          className="btn btn-primary w-full"
          disabled={!file || !ranges.trim() || loading}
          onClick={handleSplit}
        >
          {loading ? <span className="loading loading-spinner loading-sm" /> : 'Split'}
        </button>
      )}

      {isSuccess && (
        <div role="status" className="rounded-xl border border-success bg-success/10 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="mt-0.5 shrink-0 text-success" />
            <div className="flex-1">
              <p className="font-semibold text-base-content">Done!</p>
              <p className="text-sm text-base-content/70">
                {splitCount === 1
                  ? 'PDF saved to your downloads'
                  : `Split into ${splitCount} parts — saved as split.zip`}
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={reset}>
              Split another
            </button>
          </div>
        </div>
      )}

      {isError && (
        <div role="alert" className="rounded-xl border border-error bg-error/10 p-4">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="mt-0.5 shrink-0 text-error" />
            <div>
              <p className="font-semibold text-base-content">Split failed</p>
              <p className="text-sm text-base-content/70">{error}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return (
    <ToolLayout title="Split PDF" sidebar={file ? sidebar : undefined}>
      <FileDropzone onFiles={handleFiles} />
    </ToolLayout>
  )
}
