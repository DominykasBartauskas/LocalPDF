import DevPage from './components/DevPage'

export default function App() {
  if (window.location.pathname === '/dev') return <DevPage />

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <h1 className="text-2xl font-bold p-8">LocalPDF</h1>
    </main>
  )
}
