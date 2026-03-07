import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ToolGrid from './components/ToolGrid'
import MergeTool from './components/MergeTool'
import SplitTool from './components/SplitTool'
import RotateTool from './components/RotateTool'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ToolGrid />} />
        <Route path="/merge" element={<MergeTool />} />
        <Route path="/split" element={<SplitTool />} />
        <Route path="/rotate" element={<RotateTool />} />
      </Routes>
    </BrowserRouter>
  )
}
