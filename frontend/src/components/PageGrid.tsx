import { useEffect, useRef, useState } from 'react'
import { RotateCw, Trash2 } from 'lucide-react'
import { Document, Page } from 'react-pdf'

const COLS = 4
const GAP = 16
const PADDING = 24

type FileEntry = { file: File; filename?: string }

type LazyPageProps = {
  file: File
  filename?: string
  pageNum: number
  cardWidth: number
  cardHeight: number
  selected: boolean
  rotation: number
  onClick?: () => void
  onRotate: () => void
  onDelete: () => void
}

function LazyPage({ file, filename, pageNum, cardWidth, cardHeight, selected, rotation, onClick, onRotate, onDelete }: LazyPageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const isLandscape = (rotation / 90) % 2 !== 0
  const rotationScale = isLandscape ? cardWidth / cardHeight : 1

  return (
    <div
      ref={ref}
      onClick={onClick}
      onTransitionEnd={(e) => { if (deleting && e.propertyName === 'opacity') onDelete() }}
      className={`group flex flex-col gap-2 transition-all duration-200 ${deleting ? 'scale-90 opacity-0' : ''} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-2xl shadow-md transition-all ${
          selected ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-lg'
        }`}
        style={{ height: cardHeight }}
      >
        {visible ? (
          <>
            <div
              style={{
                transform: `rotate(${rotation}deg) scale(${rotationScale})`,
                transition: 'transform 0.25s ease',
              }}
            >
              <Document file={file}>
                <Page
                  pageNumber={pageNum}
                  width={cardWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
            {filename && (
              <div className="absolute bottom-0 left-0 right-0 truncate bg-black/40 px-2 py-1 text-center text-xs text-white backdrop-blur-sm">
                {filename}
              </div>
            )}
          </>
        ) : (
          <div className="h-full w-full animate-pulse bg-base-200" />
        )}

        {/* Action buttons — visible on hover */}
        <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            title="Rotate 90°"
            onClick={e => { e.stopPropagation(); onRotate() }}
          >
            <RotateCw size={14} />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-error/80"
            title="Delete page"
            onClick={e => { e.stopPropagation(); setDeleting(true) }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="text-center text-sm text-base-content/40">{pageNum}</p>
    </div>
  )
}

type Props = {
  files: FileEntry[]
  selectedPages?: Set<number>  // global indices across all files
  onPageClick?: (globalIndex: number) => void
  rotations?: Map<number, number>  // controlled: parent owns rotation state
  onRotatePage?: (globalIndex: number, degrees: number) => void
  onDeletePage?: (globalIndex: number) => void
}

export default function PageGrid({ files, selectedPages, onPageClick, rotations: controlledRotations, onRotatePage, onDeletePage  }: Props) {
  const [pageCounts, setPageCounts] = useState<Map<File, number>>(() => new Map())
  const [cardWidth, setCardWidth] = useState(180)
  const [internalRotations, setInternalRotations] = useState<Map<number, number>>(() => new Map())
  const [deletedPages, setDeletedPages] = useState<Set<number>>(() => new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  const isControlled = controlledRotations !== undefined
  const effectiveRotations = isControlled ? controlledRotations : internalRotations

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.floor((entry.contentRect.width - PADDING * 2 - GAP * (COLS - 1)) / COLS)
      setCardWidth(w)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const cardHeight = Math.ceil(cardWidth * 1.42)

  let globalIndex = 0
  const allPages = files.flatMap(entry =>
    Array.from({ length: pageCounts.get(entry.file) ?? 0 }, (_, pi) => ({
      key: `${entry.file.name}-${entry.file.size}-${pi}`,
      file: entry.file,
      filename: entry.filename,
      pageNum: pi + 1,
      globalIndex: globalIndex++,
    }))
  )

  const handleRotate = (idx: number) => {
    const current = effectiveRotations.get(idx) ?? 0
    const cumulative = current + 90
    if (isControlled) {
      onRotatePage?.(idx, cumulative)
    } else {
      setInternalRotations(prev => {
        const next = new Map(prev)
        next.set(idx, cumulative)
        return next
      })
      onRotatePage?.(idx, cumulative % 360)
    }
  }

  const handleDelete = (idx: number) => {
    setDeletedPages(prev => {
      const next = new Set(prev)
      next.add(idx)
      onDeletePage?.(idx)
      return next
    })
  }

  return (
    <div ref={containerRef}>
      {/* Hidden documents used only to resolve page counts */}
      {files.map(entry => (
        <Document
          key={`${entry.file.name}-${entry.file.size}-${entry.file.lastModified}`}
          file={entry.file}
          className="hidden"
          onLoadSuccess={({ numPages }) =>
            setPageCounts(prev => new Map(prev).set(entry.file, numPages))
          }
        />
      ))}

      <div
        className="grid p-6"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: GAP }}
      >
        {allPages.filter(({ globalIndex }) => !deletedPages.has(globalIndex)).map(({ key, file, filename, pageNum, globalIndex }) => (
          <LazyPage
            key={key}
            file={file}
            filename={filename}
            pageNum={pageNum}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            selected={!!selectedPages?.has(globalIndex)}
            rotation={effectiveRotations.get(globalIndex) ?? 0}
            onClick={onPageClick ? () => onPageClick(globalIndex) : undefined}
            onRotate={() => handleRotate(globalIndex)}
            onDelete={() => handleDelete(globalIndex)}
          />
        ))}
      </div>
    </div>
  )
}
