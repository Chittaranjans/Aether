import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AppLayout } from './layouts/AppLayout'
import { AboutPage } from './pages/AboutPage'
import { DashboardPage } from './pages/DashboardPage'
import { ExplorePage } from './pages/ExplorePage'
import { FilesPage } from './pages/FilesPage'
import { HomePage } from './pages/HomePage'
import { InsightsPage } from './pages/InsightsPage'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="files" element={<FilesPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="insights/:fileName" element={<InsightsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
