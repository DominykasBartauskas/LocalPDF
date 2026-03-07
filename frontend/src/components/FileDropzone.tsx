import { useRef, useState, useCallback } from 'react'
import { UploadCloud } from 'lucide-react'

type FileDropzoneProps = {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  label?: string
  compact?: boolean
}

export default function FileDropzone({
  onFiles,
  accept = 'application/pdf',
  multiple = false,
  label = 'Click to browse or drop PDF here',
  compact = false,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      onFiles(Array.from(files))
    },
    [onFiles],
  )

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const onDragLeave = () => setDragging(false)

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const acceptedTypes = accept.split(',').map(t => t.trim())
    const validFiles = Array.from(e.dataTransfer.files).filter(file =>
      acceptedTypes.some(type => {
        if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type.toLowerCase())
        if (type.endsWith('/*')) return file.type.startsWith(type.slice(0, -1))
        return file.type === type
      }),
    )
    if (validFiles.length > 0) {
      onFiles(multiple ? validFiles : validFiles.slice(0, 1))
    }
  }

  const onClick = () => inputRef.current?.click()

  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={
        compact
          ? `flex cursor-pointer items-center justify-center gap-3 border-b border-base-300 px-4 py-8 transition-colors ${dragging ? 'bg-primary/5' : 'hover:bg-base-200'}`
          : `flex flex-1 cursor-pointer flex-col items-center justify-center transition-colors ${dragging ? 'bg-primary/5' : 'hover:bg-base-200'}`
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      <UploadCloud
        className="shrink-0 text-base-content/40"
        size={compact ? 24 : 40}
      />
      <p className={`text-base-content/60 ${compact ? 'text-sm' : 'mt-3 text-sm'}`}>{label}</p>
    </div>
  )
}
