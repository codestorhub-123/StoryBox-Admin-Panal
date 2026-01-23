'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Switch from '@mui/material/Switch'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Component Imports
import EditUserDialog from '@/components/dialogs/EditUserDialog'


// Third-party Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { toast } from 'react-toastify'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Service Imports
import { getUsers, toggleUserBlock, updateUserName } from '@/services/ApiService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Styled Components
const Icon = styled('i')({})

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const userStatusObj = {
  active: 'success',
  blocked: 'error',
}

const columnHelper = createColumnHelper()

const UserListTable = () => {
  // States
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [rowCount, setRowCount] = useState(0)
  const [globalFilter, setGlobalFilter] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const [editingUser, setEditingUser] = useState(null)

  // Hooks
  const { lang: locale } = useParams()

  const fetchData = async () => {
    setLoading(true)
    try {
      const { ok, result } = await getUsers({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalFilter
      })

      if (ok && result.success) {
        setData(result.data.docs)
        setRowCount(result.data.totalDocs)
      } else {
        toast.error(result.message || 'Failed to fetch users')
      }
    } catch (error) {
      toast.error('Error fetching users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize, globalFilter])

  const handleToggleBlock = async (id) => {
    try {
      const { ok, result } = await toggleUserBlock(id)
      if (ok && result.success) {
        toast.success('User status updated successfully')
        // Refresh data or update local state
        setData(prev => prev.map(user =>
          user._id === id ? { ...user, isBlocked: result.data.isBlocked } : user
        ))
      } else {
        toast.error(result.message || 'Failed to update status')
      }
    } catch (error) {
      toast.error('Error updating status')
    }
  }

  const handleEditClick = (user) => {
    setEditingUser(user)
    setEditDialogOpen(true)
  }



  const handleUpdateName = async (id, name) => {
    if (!name.trim()) return toast.error('Name cannot be empty')

    try {
      const { ok, result } = await updateUserName(id, name)
      if (ok && result.success) {
        toast.success('User name updated successfully')
        setData(prev => prev.map(user =>
          user._id === id ? { ...user, name: name } : user
        ))
        setEditDialogOpen(false)
      } else {
        toast.error(result.message || 'Failed to update name')
      }
    } catch (error) {
      toast.error('Error updating name')
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'User',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            {getAvatar({ avatar: row.original.image, fullName: row.original.name })}
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.name}
              </Typography>
              <Typography variant='body2'>{row.original.uniqueId}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email ? row.original.email : '-'}</Typography>
      }),
      columnHelper.accessor('loginType', {
        header: 'loginType',
        cell: ({ row }) => <Typography>{row.original.loginType}</Typography>
      }),
      columnHelper.accessor('mobileNumber', {
        header: 'Mobile',
        cell: ({ row }) => <Typography>{row.original.mobileNumber ? `${row.original.mobilePrefix} ${row.original.mobileNumber}` : '-'}</Typography>
      }),
      columnHelper.accessor('gender', {
        header: 'Gender',
        cell: ({ row }) => <Typography className='capitalize'>{row.original.gender}</Typography>
      }),
      columnHelper.accessor('coins', {
        header: 'Coins',
        cell: ({ row }) => <Typography className='capitalize'>{row.original.coins}</Typography>
      }),
      columnHelper.accessor('isBlocked', {
        header: 'Block',
        cell: ({ row }) => (
          <Switch
            checked={row.original.isBlocked}
            onChange={() => handleToggleBlock(row.original._id)}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleEditClick(row.original)}>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
            <IconButton component={Link} href={`/${locale}/apps/user/view?id=${row.original._id}`}>
              <i className='tabler-eye text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    rowCount, // ✅ Added rowCount for TablePaginationComponent
    state: {
      pagination,
    },
    manualPagination: true,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  })

  const getAvatar = params => {
    const { avatar, fullName } = params

    if (avatar) {
      return <CustomAvatar src={avatar} size={34} />
    } else {
      return <CustomAvatar size={34}>{getInitials(fullName)}</CustomAvatar>
    }
  }

  return (
    <Card>
      <CardHeader title='Users List' className='pbe-4' />
      <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
        <CustomTextField
          select
          value={table.getState().pagination.pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
          className='max-sm:is-full sm:is-[70px]'
        >
          <MenuItem value='10'>10</MenuItem>
          <MenuItem value='25'>25</MenuItem>
          <MenuItem value='50'>50</MenuItem>
        </CustomTextField>
        <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search User'
            className='max-sm:is-full'
          />
        </div>
      </div>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className='text-center p-6'>
                  <CircularProgress />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='text-center'>
                  No data available
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={rowCount}
        rowsPerPage={pagination.pageSize}
        page={pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
      />
      <EditUserDialog
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        user={editingUser}
        handleUpdateName={handleUpdateName}
      />

    </Card>
  )
}

export default UserListTable
