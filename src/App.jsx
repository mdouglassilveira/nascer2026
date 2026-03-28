import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/profile/Index'
import Project from './pages/project/Index'
import Activities from './pages/activities/Index'
import ActivityDetail from './pages/activities/Detail'
import SoftSkills from './pages/softskills/Index'
import Diagnostic from './pages/diagnostic/Index'
import Team from './pages/team/Index'
import Attendance from './pages/attendance/Index'
import Schedule from './pages/schedule/Index'
import EventDetail from './pages/schedule/Detail'
import Contents from './pages/contents/Index'
import ContentDetail from './pages/contents/Detail'
import Tools from './pages/tools/Index'
import ResetPassword from './pages/ResetPassword'
import Enrollment from './pages/enrollment/Index'
import UpdatePrompt from './components/UpdatePrompt'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/inscricao" element={
              <ProtectedRoute><Enrollment /></ProtectedRoute>
            } />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="perfil" element={<Profile />} />
              <Route path="projeto" element={<Project />} />
              <Route path="atividades" element={<Activities />} />
              <Route path="atividades/:id" element={<ActivityDetail />} />
              <Route path="soft-skills" element={<SoftSkills />} />
              <Route path="diagnostico" element={<Diagnostic />} />
              <Route path="equipe" element={<Team />} />
              <Route path="presencas" element={<Attendance />} />
              <Route path="cronograma" element={<Schedule />} />
              <Route path="cronograma/:id" element={<EventDetail />} />
              <Route path="conteudos" element={<Contents />} />
              <Route path="conteudos/:id" element={<ContentDetail />} />
              <Route path="ferramentas" element={<Tools />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <UpdatePrompt />
      </AuthProvider>
    </QueryClientProvider>
  )
}
