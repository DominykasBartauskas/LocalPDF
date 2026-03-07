import { useEffect, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'

const COLS = 4
const GAP = 16
const PADDING = 24

type FileEntry = { file: File; filename?: string }

type Props = {
  files: FileEntry[]
  selectedPages?: Set<number>  // global indices across all files
  onPageClick?: (globalIndex: number) => void
}

export default function PageGrid({ files, selectedPages, onPageClick }: Props) {
  const [pageCounts, setPageCounts] = useState<Map<File, number>>(() => new Map())
  const [cardWidth, setCardWidth] = useState(180)
  const containerRef = useRef<HTMLDivElement>(null)

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
        {allPages.map(({ key, file, filename, pageNum, globalIndex }) => {
          const selected = selectedPages?.has(globalIndex)
          return (
            <div
              key={key}
              onClick={() => onPageClick?.(globalIndex)}
              className={`flex flex-col gap-2 ${onPageClick ? 'cursor-pointer' : ''}`}
            >
              <div
                className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md transition-all ${
                  selected ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-lg'
                }`}
                style={{ height: cardHeight }}
              >
                <Document file={file}>
                  <Page
                    pageNumber={pageNum}
                    width={cardWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
                {filename && (
                  <div className="absolute bottom-0 left-0 right-0 truncate bg-black/40 px-2 py-1 text-center text-xs text-white backdrop-blur-sm">
                    {filename}
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-base-content/40">{pageNum}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
