import { useState } from 'react'
import FileDropzone from './FileDropzone'
import useApi from '../hooks/useApi'

type InfoResponse = {
  pages: number
  size_bytes: number
  title: string
  author: string
}

export default function DevPage() {
  const { data, loading, error, request } = useApi<InfoResponse>()
  const [filename, setFilename] = useState<string>('')

  const handleFiles = async (files: File[]) => {
    const file = files[0]
    setFilename(file.name)
    const body = new FormData()
    body.append('file', file)
    await request('/info', { body })
  }

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Dev — /api/info</h1>
      <FileDropzone onFiles={handleFiles} />
      {filename && <p className="mt-3 text-sm text-base-content/60">{filename}</p>}
      {loading && <p className="mt-4 text-sm">Loading…</p>}
      {error && <p className="mt-4 text-sm text-error">{error}</p>}
      {data && (
        <pre className="mt-4 rounded-lg bg-base-200 p-4 text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}
