// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const defaultSuggestions = [
  {
    sectionLabel: 'Apps',
    items: [
      {
        label: 'Dashboards',
        href: '/dashboards/crm',
        icon: 'tabler-smart-home'
      },
      {
        label: 'User List',
        href: '/apps/user/list',
        icon: 'tabler-user'
      },
      {
        label: 'Film Category',
        href: '/apps/category/list',
        icon: 'tabler-category'
      },
      {
        label: 'Film List',
        href: '/apps/story/list',
        icon: 'tabler-movie'
      },
      {
        label: 'Episode List',
        href: '/apps/episode/list',
        icon: 'tabler-video'
      },
      {
        label: 'Language',
        href: '/apps/language/list',
        icon: 'tabler-language'
      },
      {
        label: 'Coin Plan',
        href: '/apps/coin-plan/list',
        icon: 'tabler-coin'
      },
      {
        label: 'VIP Plan',
        href: '/apps/vip-plan/list',
        icon: 'tabler-crown'
      },
      {
        label: 'Reward',
        href: '/apps/reward',
        icon: 'tabler-gift'
      }
    ]
  }
]

const DefaultSuggestions = ({ setOpen }) => {
  // Hooks
  const { lang: locale } = useParams()

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-5 overflow-y-auto'>
      {defaultSuggestions[0].items.map((item, i) => (
        <Link
          key={i}
          href={getLocalizedUrl(item.href, locale)}
          onClick={() => setOpen(false)}
          className='flex flex-col items-start gap-3 p-6 border rounded-xl shadow-sm hover:shadow-lg transition cursor-pointer bg-white'
        >
          <i className={classnames(item.icon, 'text-3xl text-primary')} />
          <p className='text-[16px] font-medium !text-black dark:!text-black'>{item.label}</p>
        </Link>
      ))}
    </div>
  )
}

export default DefaultSuggestions
