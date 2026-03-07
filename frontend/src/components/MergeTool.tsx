import { useState } from 'react'
import toast from 'react-hot-toast'
import FileDropzone from './FileDropzone'
import useApi from '../hooks/useApi'

export default function MergeTool() {
  const [files, setFiles] = useState<File[]>([])
  const { loading, request } = useApi()

  const handleFiles = (incoming: File[]) => {
    setFiles(prev => [...prev, ...incoming])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleMerge = () => {
    const body = new FormData()
    files.forEach(f => body.append('files', f))
    toast.promise(
      request('/merge', { body, download: true, filename: 'merged.pdf' }),
      { loading: 'Merging…', success: 'Merged!', error: (err) => err?.message ?? 'Something went wrong' },
    )
  }

  return (
    <div className="mx-auto max-w-xl p-8">
      <h2 className="mb-6 text-2xl font-bold">Merge PDFs</h2>

      <FileDropzone onFiles={handleFiles} multiple label="Drop PDFs to merge" />

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-base-200 px-4 py-2 text-sm">
              <span className="truncate">{file.name}</span>
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

      <button
        className="btn btn-primary mt-6 w-full"
        disabled={files.length < 2 || loading}
        onClick={handleMerge}
      >
        {loading ? <span className="loading loading-spinner loading-sm" /> : `Merge ${files.length} PDFs`}
      </button>
    </div>
  )
}
