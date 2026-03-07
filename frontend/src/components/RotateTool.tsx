import { useState } from 'react'
import { CheckCircle, RefreshCw, RotateCcw, RotateCw, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import FileDropzone from './FileDropzone'
import PageGrid from './PageGrid'
import ToolLayout from './ToolLayout'
import useApi from '../hooks/useApi'

type InfoResponse = { pages: number; size_bytes: number; title: string; author: string }

export default function RotateTool() {
  const [file, setFile] = useState<File | null>(null)
  const [rotations, setRotations] = useState<Map<number, number>>(new Map())
  const [submitted, setSubmitted] = useState(false)
  const { data: info, request: requestInfo } = useApi<InfoResponse>()
  const { loading, error, request } = useApi()

  const pageCount = info?.pages ?? 0

  const nonZeroRotations = new Map([...rotations].filter(([, d]) => d % 360 !== 0))
  const showResult = submitted && !loading
  const isSuccess = showResult && !error
  const isError = showResult && !!error

  const handleFiles = async (incoming: File[]) => {
    if (!incoming.length) return
    const f = incoming[0]
    setFile(f)
    setRotations(new Map())
    setSubmitted(false)
    const body = new FormData()
    body.append('file', f)
    try {
      await requestInfo('/info', { body })
    } catch {
      toast.error('Failed to load file info')
    }
  }

  const handleRotateAll = (delta: number) => {
    setRotations(prev => {
      const next = new Map(prev)
      for (let i = 0; i < pageCount; i++) {
        next.set(i, (next.get(i) ?? 0) + delta)
      }
      return next
    })
  }

  const handleRotatePage = (idx: number, cumulative: number) => {
    setRotations(prev => new Map(prev).set(idx, cumulative))
  }

  const handleSubmit = async () => {
    if (!file || nonZeroRotations.size === 0) return
    const body = new FormData()
    body.append('file', file)
    body.append(
      'rotations',
      JSON.stringify(Object.fromEntries(
        [...nonZeroRotations].map(([k, v]) => [k, ((v % 360) + 360) % 360])
      ))
    )
    setSubmitted(false)
    try {
      await request('/rotate', { body, download: true, filename: 'rotated.pdf' })
    } finally {
      setSubmitted(true)
    }
  }

  const reset = () => {
    setFile(null)
    setRotations(new Map())
    setSubmitted(false)
  }

  const sidebar = (
    <>
      {file && (
        <p className="mb-4 text-sm text-base-content/60">
          {file.name}{info ? ` — ${info.pages} pages` : ''}
        </p>
      )}

      {file && pageCount > 0 && (
        <div className="mb-6">
          <p className="label-text mb-2 text-xs text-base-content/50">Rotate all pages</p>
          <div className="flex gap-2">
            <button
              className="btn btn-ghost btn-sm flex-1"
              title="Rotate all clockwise (+90°)"
              onClick={() => handleRotateAll(90)}
            >
              <RotateCw size={16} />
            </button>
            <button
              className="btn btn-ghost btn-sm flex-1"
              title="Flip all 180°"
              onClick={() => handleRotateAll(180)}
            >
              <RefreshCw size={16} />
            </button>
            <button
              className="btn btn-ghost btn-sm flex-1"
              title="Rotate all counter-clockwise (−90°)"
              onClick={() => handleRotateAll(-90)}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      )}

      {!isSuccess && (
        <button
          className="btn btn-primary w-full"
          disabled={!file || nonZeroRotations.size === 0 || loading}
          onClick={handleSubmit}
        >
          {loading ? <span className="loading loading-spinner loading-sm" /> : 'Apply Rotations'}
        </button>
      )}

      {isSuccess && (
        <div role="status" className="rounded-xl border border-success bg-success/10 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="mt-0.5 shrink-0 text-success" />
            <div className="flex-1">
              <p className="font-semibold text-base-content">Rotated successfully</p>
              <p className="text-sm text-base-content/70">
                {nonZeroRotations.size} page{nonZeroRotations.size !== 1 ? 's' : ''} rotated
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={reset}>
              Rotate another
            </button>
          </div>
        </div>
      )}

      {isError && (
        <div role="alert" className="rounded-xl border border-error bg-error/10 p-4">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="mt-0.5 shrink-0 text-error" />
            <div>
              <p className="font-semibold text-base-content">Rotation failed</p>
              <p className="text-sm text-base-content/70">{error}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return (
    <ToolLayout title="Rotate PDF" sidebar={file ? sidebar : undefined}>
      <FileDropzone onFiles={handleFiles} compact={!!file} label={file ? 'Click to browse or drop a PDF to replace' : undefined} />
      {file && (
        <div className="h-full overflow-y-auto">
          <PageGrid
            files={[{ file, filename: file.name }]}
            rotations={rotations}
            onRotatePage={handleRotatePage}
          />
        </div>
      )}
    </ToolLayout>
  )
}
