import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { DataProvider } from '@/context/DataContext'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Members } from '@/pages/Members'
import { MemberDetail } from '@/pages/MemberDetail'
import { Households } from '@/pages/Households'
import { HouseholdDetail } from '@/pages/HouseholdDetail'
import { UserManagement } from '@/pages/UserManagement'
import { PendingAccounts } from '@/pages/PendingAccounts'
import { CallingManagement } from '@/pages/CallingManagement'

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/members" element={<Members />} />
              <Route path="/members/:id" element={<MemberDetail />} />
              <Route path="/households" element={<Households />} />
              <Route path="/households/:id" element={<HouseholdDetail />} />
              <Route
                path="/users"
                element={
                  <ProtectedRoute requireRole="admin">
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="/pending-accounts" element={<PendingAccounts />} />
              <Route
                path="/callings"
                element={
                  <ProtectedRoute requireRole="admin">
                    <CallingManagement />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}
