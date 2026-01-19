// Next Imports
import { headers } from 'next/headers'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Component Imports

// HOC Imports
import TranslationWrapper from '@/hocs/TranslationWrapper'

// Config Imports
import { i18n } from '@configs/i18n'
import AuthProvider from '@/contexts/AuthProvider'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
  title: 'Storybox',
  description:
    'Storybox'
}

const RootLayout = async props => {
  const params = await props.params
  const { children } = props

  // Vars
  const headersList = await headers()
  const systemMode = await getSystemMode()
  const direction = i18n.langDirection[params.lang]

  return (
    <TranslationWrapper headersList={headersList} lang={params.lang}>
      <html id='__next' lang={params.lang} dir={direction} suppressHydrationWarning>
        <body className='flex is-full min-bs-full flex-auto flex-col'>
          <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
          <AuthProvider lang={params.lang}>{children}</AuthProvider>
        </body>
      </html>
    </TranslationWrapper>
  )
}

export default RootLayout
