'use client'

// React Imports
import { useRef } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'

// Third-party Imports
import { useSession } from 'next-auth/react'

// Hook Imports
// import { useSettings } from '@core/hooks/useSettings' // Not used anymore

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const router = useRouter()
  const { data: session } = useSession()
  // const { settings } = useSettings() // Not used anymore
  const { lang: locale } = useParams()

  const handleProfileClick = () => {
    router.push(getLocalizedUrl('/pages/user-profile', locale))
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleProfileClick} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt={session?.user?.name || ''}
          src={session?.user?.image || ''}
          onClick={handleProfileClick}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>
    </>
  )
}

export default UserDropdown

