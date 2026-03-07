import { useRef, useState, useCallback } from 'react'

type FileDropzoneProps = {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  label?: string
}

export default function FileDropzone({
  onFiles,
  accept = 'application/pdf',
  multiple = false,
  label = 'Drop PDF here or click to browse',
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
      className={`flex flex-1 cursor-pointer flex-col items-center justify-center transition-colors ${
        dragging ? 'bg-primary/5' : 'hover:bg-base-200'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mb-3 h-10 w-10 text-base-content/40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p className="text-sm text-base-content/60">{label}</p>
    </div>
  )
}
