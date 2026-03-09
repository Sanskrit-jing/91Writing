import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useNovelStore } from './store/novelStore'
import Dashboard from './components/Dashboard'
import HomePage from './components/HomePage'
import NovelManagement from './components/NovelManagement'
import PromptsLibrary from './components/PromptsLibrary'
import ToolsLibrary from './components/ToolsLibrary'
import ChapterManagement from './components/ChapterManagement'
import WritingGoals from './components/WritingGoals'
import TokenBilling from './components/TokenBilling'
import ShortStory from './components/ShortStory'
import BookAnalysis from './components/BookAnalysis'
import GenreManagement from './components/GenreManagement'
import Settings from './components/Settings'
import Writer from './components/Writer'

function App() {
  const { darkMode, currentConfigType } = useNovelStore()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<HomePage />} />
          <Route path="novels" element={<NovelManagement />} />
          <Route path="prompts" element={<PromptsLibrary />} />
          <Route path="tools" element={<ToolsLibrary />} />
          <Route path="chapters" element={<ChapterManagement />} />
          <Route path="goals" element={<WritingGoals />} />
          <Route path="billing" element={<TokenBilling />} />
          <Route path="short-story" element={<ShortStory />} />
          <Route path="book-analysis" element={<BookAnalysis />} />
          <Route path="genres" element={<GenreManagement />} />
          <Route path="settings" element={<Settings />} />
          <Route path="writer/:novelId" element={<Writer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
