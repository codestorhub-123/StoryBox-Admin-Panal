'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import themeConfig from '@configs/themeConfig'

import { getLocalizedUrl } from '@/utils/i18n'

const AuthProvider = ({ children, lang }) => {
  const router = useRouter()

  useEffect(() => {
    // Intercept fetch requests
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const response = await originalFetch(...args)

      // Clone response to read body without consuming it for proper error handling
      const clone = response.clone()

      try {
        const result = await clone.json()

        // Check for specific error code 2002 or jwt expired message
        if (
          response.status === 401 &&
          (result?.code === 2002 || result?.error === 'jwt expired' || result?.message === 'Invalid token')
        ) {
          localStorage.removeItem('token')
          localStorage.removeItem('admin')
          localStorage.removeItem('userData')

          // Redirect to login with correct locale
          const loginUrl = getLocalizedUrl('/login', lang || 'en')
          window.location.href = loginUrl
        }
      } catch (e) {
        // Ignore JSON parse errors for non-JSON responses
      }

      return response
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [router, lang])

  return children
}

export default AuthProvider
