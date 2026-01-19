const horizontalMenuData = dictionary => [
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
    children: [
      {
        label: dictionary['navigation'].list,
        href: '/apps/user/list'
      },
      {
        label: dictionary['navigation'].view,
        href: '/apps/user/view'
      }
    ]
  }
]

export default horizontalMenuData
