import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import FileDropzone from './FileDropzone'
import PageGrid from './PageGrid'
import ToolLayout from './ToolLayout'
import useApi from '../hooks/useApi'

export default function MergeTool() {
  const [files, setFiles] = useState<File[]>([])
  const [submitted, setSubmitted] = useState(false)
  const { loading, error, request } = useApi()

  const showResult = submitted && !loading
  const isSuccess = showResult && !error
  const isError = showResult && !!error

  const handleFiles = (incoming: File[]) => {
    setFiles(prev => [...prev, ...incoming])
    setSubmitted(false)
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setSubmitted(false)
  }

  const handleMerge = async () => {
    const body = new FormData()
    files.forEach(f => body.append('files', f))
    setSubmitted(false)
    try {
      await request('/merge', { body, download: true, filename: 'merged.pdf' })
    } finally {
      setSubmitted(true)
    }
  }

  const reset = () => {
    setFiles([])
    setSubmitted(false)
  }

  const sidebar = (
    <>
      {files.length > 0 && (
        <ul className="mb-6 space-y-2">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-base-300 bg-base-100 px-4 py-2 text-sm"
            >
              <span className="truncate text-base-content">{file.name}</span>
              <button
                className="btn btn-ghost btn-xs ml-4 text-error"
                onClick={() => removeFile(i)}
                aria-label={`Remove ${file.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {!isSuccess && (
        <button
          className="btn btn-primary w-full"
          disabled={files.length < 2 || loading}
          onClick={handleMerge}
        >
          {loading
            ? <span className="loading loading-spinner loading-sm" />
            : `Merge ${files.length > 0 ? files.length : ''} PDFs`.trim()}
        </button>
      )}

      {isSuccess && (
        <div role="status" className="rounded-xl border border-success bg-success/10 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="mt-0.5 shrink-0 text-success" />
            <div className="flex-1">
              <p className="font-semibold text-base-content">Merged successfully</p>
              <p className="text-sm text-base-content/70">{files.length} files merged into one PDF</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={reset}>
              Merge more
            </button>
          </div>
        </div>
      )}

      {isError && (
        <div role="alert" className="rounded-xl border border-error bg-error/10 p-4">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="mt-0.5 shrink-0 text-error" />
            <div>
              <p className="font-semibold text-base-content">Merge failed</p>
              <p className="text-sm text-base-content/70">{error}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return (
    <ToolLayout title="Merge PDFs" sidebar={files.length > 0 ? sidebar : undefined}>
      <FileDropzone onFiles={handleFiles} multiple compact={files.length > 0} label={files.length > 0 ? 'Click to browse or drop PDFs to add more' : undefined} />
      {files.length > 0 && (
        <div className="h-full overflow-y-auto">
          <PageGrid files={files.map(f => ({ file: f, filename: f.name }))} />
        </div>
      )}
    </ToolLayout>
  )
}
