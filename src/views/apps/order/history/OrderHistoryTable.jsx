'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

// Third-party Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { toast } from 'react-toastify'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Service Imports
import { getOrderHistory } from '@/services/ApiService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const OrderHistoryTable = () => {
  // States
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('coin')
  
  // Detail Dialog States
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [summary, setSummary] = useState({ totalHistory: 0, totalAdminEarnings: 0 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const { ok, result } = await getOrderHistory({ type })

      if (ok && result.success) {
        setData(result.data.history || [])
        setSummary({
          totalHistory: result.data.totalHistory || 0,
          totalAdminEarnings: result.data.totalAdminEarnings || 0
        })
      } else {
        toast.error(result.message || 'Failed to fetch order history')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error fetching order history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [type])

  const handleShowHistory = (user) => {
    setSelectedUser(user)
    setOpen(true)
  }

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'no',
        header: 'No',
        cell: ({ row }) => <Typography variant='body2'>{row.index + 1}</Typography>
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography color='text.primary' className='font-medium'>{row.original.name || 'N/A'}</Typography>
            <Typography variant='caption'>{row.original.username || ''}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('totalPlansPurchased', {
        header: 'Total Purchases',
        cell: ({ row }) => <Typography>{row.original.totalPlansPurchased}</Typography>
      }),
      columnHelper.accessor('totalAmountSpent', {
        header: 'Amount Spent',
        cell: ({ row }) => <Typography className='font-medium text-success'>${row.original.totalAmountSpent}</Typography>
      }),
      columnHelper.display({
        id: 'history',
        header: 'History',
        cell: ({ row }) => (
          <IconButton onClick={() => handleShowHistory(row.original)} color='primary' size='small'>
             <i className='tabler-history' />
          </IconButton>
        )
      })
    ],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // History Detail Columns
  const detailColumns = useMemo(
    () => [
       { id: 'no', header: 'NO', cell: (info) => info.row.index + 1 },
       { accessorKey: 'uniqueId', header: 'UNIQUEID' },
       { accessorKey: 'price', header: 'PRICE ($)', cell: (info) => <span className='text-success'>${info.getValue()}</span> },
       { accessorKey: 'coin', header: 'COIN' },
       { accessorKey: 'date', header: 'DATE', cell: (info) => {
           const dateStr = info.getValue()
           return dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'N/A'
       }}
    ],
    []
  )

  const detailTable = useReactTable({
    data: selectedUser ? (type === 'coin' ? selectedUser.coinPlanPurchase : selectedUser.vipPlanPurchase) : [],
    columns: detailColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Box className='flex flex-col gap-4'>
      <Tabs
        value={type}
        onChange={(e, newValue) => setType(newValue)}
        variant='standard'
        sx={{
          '& .MuiTabs-indicator': { display: 'none' },
          '& .MuiTab-root': {
            minHeight: '38px',
            borderRadius: '6px',
            textTransform: 'none',
            fontWeight: 500,
            mr: 2,
            px: 4,
            transition: 'all 0.2s',
            color: 'text.secondary',
            '&.Mui-selected': {
              backgroundColor: 'error.main',
              color: 'common.white',
            }
          }
        }}
      >
        <Tab value='coin' label='Coin Plan' />
        <Tab value='vip' label='VIP Plan' />
      </Tabs>

      <Card>
        <CardHeader 
          title={`${type === 'coin' ? 'Coin' : 'VIP'} Plan History`}
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <Box className='flex items-center'>
              <Typography variant='h6' className='text-success font-bold'>
                Admin Earnings : {summary.totalAdminEarnings} $
              </Typography>
            </Box>
          }
        />
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
                 <tr><td colSpan={5} className='text-center p-6'><CircularProgress /></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className='text-center p-6'>No records found</td></tr>
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

      {/* Detail Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='lg'>
          <DialogTitle className='border-b pb-4'>
            <Typography variant='h5'>{selectedUser?.name}'s {type === 'coin' ? 'Coin' : 'VIP'} Plan Purchase History</Typography>
          </DialogTitle>
          <DialogContent className='p-0'>
              <div className='overflow-x-auto'>
                  <table className={tableStyles.table}>
                      <thead>
                          {detailTable.getHeaderGroups().map(hg => (
                              <tr key={hg.id}>
                                  {hg.headers.map(h => <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>)}
                              </tr>
                          ))}
                      </thead>
                      <tbody>
                          {detailTable.getRowModel().rows.map(row => (
                              <tr key={row.id}>
                                  {row.getVisibleCells().map(cell => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </DialogContent>
          <DialogActions className='p-4 border-t'>
              <Button onClick={() => setOpen(false)} variant='tonal' color='secondary'>Close</Button>
          </DialogActions>
      </Dialog>
      </Card>
    </Box>
  )
}

export default OrderHistoryTable
