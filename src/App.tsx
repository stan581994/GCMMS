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
import { CallingManagement } from '@/pages/CallingManagement'
import { ChildRecordManagement } from '@/pages/ChildRecordManagement'
import { ClerkCallings } from '@/pages/ClerkCallings'
import { ClerkChildRecords } from '@/pages/ClerkChildRecords'

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
              <Route
                path="/callings"
                element={
                  <ProtectedRoute requireRole="admin">
                    <CallingManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/child-records"
                element={
                  <ProtectedRoute requireRole="admin">
                    <ChildRecordManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clerk/callings"
                element={
                  <ProtectedRoute requireRole="clerk">
                    <ClerkCallings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clerk/child-records"
                element={
                  <ProtectedRoute requireRole="clerk">
                    <ClerkChildRecords />
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
