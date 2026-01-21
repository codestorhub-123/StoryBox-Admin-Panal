'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Switch from '@mui/material/Switch'

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
import TablePaginationComponent from '@components/TablePaginationComponent'
import CoinPlanDialog from '@/components/dialogs/CoinPlanDialog'

// Service Imports
import { getCoinPlans, createCoinPlan, updateCoinPlan, deleteCoinPlan } from '@/services/ApiService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const CoinPlanListTable = () => {
  // States
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [rowCount, setRowCount] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { ok, result } = await getCoinPlans({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
      })

      if (ok && result.success) {
        setData(result.data.docs)
        setRowCount(result.data.totalDocs)
      } else {
        toast.error(result.message || 'Failed to fetch coin plans')
      }
    } catch (error) {
      toast.error('Error fetching coin plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize])

  const handleAddClick = () => {
    setEditingPlan(null)
    setDialogOpen(true)
  }

  const handleEditClick = (plan) => {
    setEditingPlan(plan)
    setDialogOpen(true)
  }

  const handleSave = async (id, formData) => {
    try {
      let res;
      if (id) {
        res = await updateCoinPlan(id, formData)
      } else {
        res = await createCoinPlan(formData)
      }

      if (res.ok && res.result.success) {
        toast.success(id ? 'Plan updated successfully' : 'Plan created successfully')
        setDialogOpen(false)
        fetchData()
      } else {
        toast.error(res.result.message || 'Failed to save plan')
      }
    } catch (error) {
      toast.error('Error saving plan')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this plan?')) return

    try {
      const { ok, result } = await deleteCoinPlan(id)
      if (ok && result.success) {
        toast.success('Plan deleted successfully')
        fetchData()
      } else {
        toast.error(result.message || 'Failed to delete plan')
      }
    } catch (error) {
      toast.error('Error deleting plan')
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
      try {
          const { ok, result } = await updateCoinPlan(id, { isActive: !currentStatus })
          if(ok && result.success) {
              toast.success('Status updated')
              setData(prev => prev.map(item => item._id === id ? { ...item, isActive: !currentStatus } : item))
          }
      } catch (error) {
          toast.error('Error updating status')
      }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('no', {
        header: 'No',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {pagination.pageIndex * pagination.pageSize + row.index + 1}
          </Typography>
        )
      }),
      columnHelper.accessor('name', {
        header: 'ProductKey',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: ({ row }) => <Typography>₹{row.original.price}</Typography>
      }),
      columnHelper.accessor('offerPrice', {
        header: 'Offer Price',
        cell: ({ row }) => <Typography color='primary'>₹{row.original.offerPrice}</Typography>
      }),
      columnHelper.accessor('coin', {
        header: 'Coin',
        cell: ({ row }) => <Typography>{row.original.coin}</Typography>
      }),
      columnHelper.accessor('bonusCoin', {
        header: 'Bonus Coin',
        cell: ({ row }) => <Typography color='success.main'>+{row.original.bonusCoin}</Typography>
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: ({ row }) => <Typography>{new Date(row.original.createdAt).toLocaleDateString()}</Typography>
      }),
      columnHelper.accessor('isActive', {
        header: 'Active',
        cell: ({ row }) => (
          <Switch
            checked={row.original.isActive}
            onChange={() => handleToggleStatus(row.original._id, row.original.isActive)}
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
            <IconButton onClick={() => handleDelete(row.original._id)}>
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [data, pagination]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    manualPagination: true,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card>
      <CardHeader 
        title='Coin Plans' 
        action={
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={handleAddClick}>
            Add New Plan
          </Button>
        }
      />
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
      <CoinPlanDialog 
        open={dialogOpen} 
        setOpen={setDialogOpen} 
        plan={editingPlan} 
        handleSave={handleSave} 
      />
    </Card>
  )
}

export default CoinPlanListTable
