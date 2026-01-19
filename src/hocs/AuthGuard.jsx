'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, usePathname, useRouter } from 'next/navigation'

// Config Imports
import themeConfig from '@configs/themeConfig'

export default function AuthGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { lang: locale } = useParams()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const currentLocale = locale || 'en'

    if (token) {
      setIsAuthenticated(true)
      setIsLoading(false)
    } else {
      // Redirect to login page with current path as redirectTo
      const loginUrl = `/${currentLocale}/login?redirectTo=${pathname}`

      router.replace(loginUrl)
    }
  }, [pathname, locale, router])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
      </div>
    )
  }

  return isAuthenticated ? children : null
}
