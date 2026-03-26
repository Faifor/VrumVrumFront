import { Outlet } from 'react-router-dom'
import { ToastContainer } from '@/components/ui/Toast'

export default function AppLayout() {
  return (
    <>
      <Outlet />
      <ToastContainer />
    </>
  )
}
