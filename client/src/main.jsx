import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { router } from './app/router'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { Loader } from "./components/ui/Loader"
import "./styles/index.css";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Suspense fallback={<div className="grid min-h-screen place-items-center"><Loader /></div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  </StrictMode>,
);
