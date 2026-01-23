// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { signOut } from 'next-auth/react'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { getLocalizedUrl } from '@/utils/i18n'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('admin')
      localStorage.removeItem('userData')

      await signOut({ redirect: false })

      window.location.href = getLocalizedUrl('/login', locale || 'en')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href={`/${locale}/dashboards/crm`} icon={<i className='tabler-smart-home' />}>
          {dictionary['navigation'].dashboards}
        </MenuItem>
        <MenuItem href={`/${locale}/apps/user/list`} icon={<i className='tabler-user' />}>
          {dictionary['navigation'].user}
        </MenuItem>
        <MenuSection label='FILM MANAGEMENT'>
          <MenuItem href={`/${locale}/apps/category/list`} icon={<i className='tabler-category' />}>
             Film Category
          </MenuItem>
          <MenuItem href={`/${locale}/apps/story/list`} icon={<i className='tabler-movie' />}>
             Film List
          </MenuItem>
          <MenuItem href={`/${locale}/apps/episode/list`} icon={<i className='tabler-video' />}>
             Episode List
          </MenuItem>
          <MenuItem href={`/${locale}/apps/content`} icon={<i className='tabler-file-text' />}>
             Content 
          </MenuItem>
         
        </MenuSection>
          <MenuSection label='Package'>
             <MenuItem href={`/${locale}/apps/coin-plan/list`} icon={<i className='tabler-coin' />}>
               Coin Plan
            </MenuItem>
             <MenuItem href={`/${locale}/apps/vip-plan/list`} icon={<i className='tabler-crown' />}>
               VIP Plan
            </MenuItem>
            <MenuItem href={`/${locale}/apps/order/history`} icon={<i className='tabler-file-invoice' />}>
               Order History
            </MenuItem>
          </MenuSection>
        <MenuSection label='OTHERS'>
           <MenuItem href={`/${locale}/apps/language/list`} icon={<i className='tabler-language' />}>
             Language
          </MenuItem>
        
          <MenuItem href={`/${locale}/apps/setting`} icon={<i className='tabler-settings' />}>
             Settings
          </MenuItem>
          <MenuItem href={`/${locale}/apps/reward`} icon={<i className='tabler-gift' />}>
             Reward
          </MenuItem>
           <MenuItem href={`/${locale}/pages/user-profile`} icon={<i className='tabler-user-circle' />}>
             Profile
          </MenuItem>
          <MenuItem icon={<i className='tabler-logout' />} onClick={handleLogout}>
             Logout
          </MenuItem>
        </MenuSection>

      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
