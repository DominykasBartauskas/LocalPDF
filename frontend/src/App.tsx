import MergeTool from './components/MergeTool'
import SplitTool from './components/SplitTool'

export default function App() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <h1 className="text-2xl font-bold p-8">LocalPDF</h1>
      <MergeTool />
      <SplitTool />
    </main>
  )
}
