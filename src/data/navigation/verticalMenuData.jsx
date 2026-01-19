const verticalMenuData = dictionary => [
  // Dashboard - Direct link to CRM
  {
    label: dictionary['navigation'].dashboards,
    icon: 'tabler-smart-home',
    href: '/dashboards/crm'
  },
  // User
  {
    label: dictionary['navigation'].user,
    icon: 'tabler-user',
    href: '/apps/user/list'
  }
]

export default verticalMenuData
