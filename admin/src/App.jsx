import { Toaster } from 'react-hot-toast'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import NotFound from './pages/404/NotFound'
import Dashboard from './pages/admin/Dashboard'
import HomeLayout from './components/Layout/HomeLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/Layout/AdminLayout'
import Skills from './pages/admin/Skills'
import Education from './pages/admin/Education'
import Experience from './pages/admin/Experience'
import Projects from './pages/admin/Projects'
import SelectedProjectPage from './pages/admin/SelectedProjectPage'
import About from './pages/admin/About';
import Notifications from './pages/admin/Notifications';
import Resume from './pages/admin/Resume';

const App = () => {
  return (
    <>
      <Toaster position='top-center' />

      <Routes>
        {/* Public layout */}
        <Route path='/' element={<HomeLayout />}>
          <Route index element={<Home />} />
          <Route path='login' element={<Auth />} />
        </Route>

        {/* Protected admin routes */}
        <Route path='/admin' element={<ProtectedRoute />}>
          <Route path='' element={<AdminLayout />}>
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='skills' element={<Skills />} />
            <Route path='education' element={<Education />} />
            <Route path='experience' element={<Experience />} />
            <Route path='projects' element={<Projects />} />
            <Route path='projects/:id' element={<SelectedProjectPage />} />
            <Route path='about' element={<About />} />
            <Route path='notifications' element={<Notifications />} />
            <Route path='resume' element={<Resume />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App