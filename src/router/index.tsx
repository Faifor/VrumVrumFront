import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireUser, RequireAdmin, RequireGuest } from './guards'
import AppLayout from '@/components/layout/AppLayout'
import ClientLayout from '@/components/layout/ClientLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/Login'))
const RegisterPage = lazy(() => import('@/pages/auth/Register'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPassword'))

// Client pages
const ClientDashboard = lazy(() => import('@/pages/client/Dashboard'))
const ClientProfile = lazy(() => import('@/pages/client/Profile'))
const ClientDocument = lazy(() => import('@/pages/client/Document'))
const ClientPayments = lazy(() => import('@/pages/client/Payments'))
const PaymentReturn = lazy(() => import('@/pages/client/PaymentReturn'))

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminUsers = lazy(() => import('@/pages/admin/Users'))
const AdminUserDetail = lazy(() => import('@/pages/admin/UserDetail'))
const AdminInventory = lazy(() => import('@/pages/admin/Inventory'))

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner fullScreen />}>{children}</Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/cabinet" replace /> },

      // ─── Auth ──────────────────────────────────────────────────────────────
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            element: (
              <RequireGuest>
                <Wrap><LoginPage /></Wrap>
              </RequireGuest>
            ),
          },
          {
            path: 'register',
            element: (
              <RequireGuest>
                <Wrap><RegisterPage /></Wrap>
              </RequireGuest>
            ),
          },
          {
            path: 'forgot-password',
            element: (
              <RequireGuest>
                <Wrap><ForgotPasswordPage /></Wrap>
              </RequireGuest>
            ),
          },
          {
            path: 'reset-password',
            element: (
              <RequireGuest>
                <Wrap><ResetPasswordPage /></Wrap>
              </RequireGuest>
            ),
          },
          { index: true, element: <Navigate to="login" replace /> },
        ],
      },

      // ─── Client cabinet ────────────────────────────────────────────────────
      {
        path: 'cabinet',
        element: (
          <RequireUser>
            <ClientLayout />
          </RequireUser>
        ),
        children: [
          { index: true, element: <Wrap><ClientDashboard /></Wrap> },
          { path: 'profile', element: <Wrap><ClientProfile /></Wrap> },
          { path: 'document/:id', element: <Wrap><ClientDocument /></Wrap> },
          { path: 'payments', element: <Wrap><ClientPayments /></Wrap> },
          { path: 'payment/return', element: <Wrap><PaymentReturn /></Wrap> },
        ],
      },

      // ─── Admin panel ───────────────────────────────────────────────────────
      {
        path: 'admin',
        element: (
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        ),
        children: [
          { index: true, element: <Wrap><AdminDashboard /></Wrap> },
          { path: 'users', element: <Wrap><AdminUsers /></Wrap> },
          { path: 'users/:id', element: <Wrap><AdminUserDetail /></Wrap> },
          { path: 'inventory', element: <Wrap><AdminInventory /></Wrap> },
        ],
      },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
