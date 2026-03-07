import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type Props = {
  title: string
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export default function ToolLayout({ title, children, sidebar }: Props) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-base-100">
      <header className="flex items-center gap-3 border-b border-base-300 bg-base-100 px-4 py-3">
        <button
          className="btn btn-ghost btn-sm rounded-xl gap-1.5"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} />
          All tools
        </button>
        <span className="text-base-300">|</span>
        <span className="font-semibold text-base-content">{title}</span>
      </header>

      <main className="flex h-[calc(100vh-3.25rem)]">
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
        <aside className={`shrink-0 overflow-hidden border-base-300 bg-base-200 transition-[width] duration-300 ease-in-out ${
          sidebar ? 'w-80 border-l' : 'w-0'
        }`}>
          <div className="h-full w-80 overflow-y-auto px-6 py-8">
            {sidebar}
          </div>
        </aside>
      </main>
    </div>
  )
}
