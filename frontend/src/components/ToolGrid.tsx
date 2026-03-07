import { Archive, ArrowUpDown, FileMinus, FilePlus2, Image, RotateCw, Scissors } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

type Tool = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  available: boolean
}

const TOOLS: Tool[] = [
  {
    id: 'merge',
    label: 'Merge',
    description: 'Combine multiple PDFs into one file',
    icon: FilePlus2,
    available: true,
  },
  {
    id: 'split',
    label: 'Split',
    description: 'Extract pages or ranges from a PDF',
    icon: Scissors,
    available: true,
  },
  {
    id: 'rotate',
    label: 'Rotate',
    description: 'Rotate pages within a PDF',
    icon: RotateCw,
    available: false,
  },
  {
    id: 'delete',
    label: 'Delete Pages',
    description: 'Remove pages from a PDF',
    icon: FileMinus,
    available: false,
  },
  {
    id: 'reorder',
    label: 'Reorder',
    description: 'Rearrange pages in a PDF',
    icon: ArrowUpDown,
    available: false,
  },
  {
    id: 'compress',
    label: 'Compress',
    description: 'Reduce PDF file size',
    icon: Archive,
    available: false,
  },
  {
    id: 'extract-images',
    label: 'Extract Images',
    description: 'Pull embedded images from a PDF',
    icon: Image,
    available: false,
  },
]

export default function ToolGrid() {
  return (
    <div className="min-h-screen bg-base-100">
      <header className="flex h-14 items-center gap-3 border-b border-base-300 px-6">
        <img src="/favicon.svg" alt="LocalPDF" className="h-6 w-6" />
        <h1 className="text-lg font-bold text-primary">LocalPDF</h1>
        <span className="text-sm text-base-content/40">— Your private PDF toolkit</span>
      </header>

      <main className="px-8 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {TOOLS.map(tool => {
            const cardBody = (
              <div className="card-body p-5">
                <div className="flex items-start gap-4">
                  <tool.icon
                    size={72}
                    className={`shrink-0 ${tool.available ? 'text-primary' : 'text-base-content/40'}`}
                  />
                  <div>
                    <h2 className="text-base font-bold text-base-content">{tool.label}</h2>
                    <p className="mt-1 text-sm text-base-content/60 leading-snug">{tool.description}</p>
                  </div>
                </div>
              </div>
            )

            return tool.available ? (
              <Link
                key={tool.id}
                to={`/${tool.id}`}
                className="card rounded-xl border-2 border-base-300 bg-base-100 transition-all hover:border-primary hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {cardBody}
              </Link>
            ) : (
              <div
                key={tool.id}
                className="card rounded-xl border-2 border-base-300 bg-base-100 opacity-40 cursor-not-allowed"
                aria-disabled="true"
              >
                {cardBody}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
