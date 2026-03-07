import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type Props = {
  title: string
  children: React.ReactNode
}

export default function ToolLayout({ title, children }: Props) {
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

      <main className="mx-auto w-full px-4 py-10 md:w-3/5 md:px-0">
        {children}
      </main>
    </div>
  )
}
