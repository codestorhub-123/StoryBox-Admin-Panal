'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'

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
import TablePaginationComponent from '@components/TablePaginationComponent'
import AdRewardDialog from '@/components/dialogs/AdRewardDialog'

// Service Imports
import { getAdRewards, createAdReward, updateAdReward, deleteAdReward } from '@/services/ApiService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const AdRewardListTable = () => {
  // States
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [rowCount, setRowCount] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReward, setEditingReward] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { ok, result } = await getAdRewards({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
      })

      if (ok && result.success) {
        setData(result.data.docs || result.data || [])
        setRowCount(result.data.totalDocs || (Array.isArray(result.data) ? result.data.length : 0))
      } else {
        toast.error(result.message || 'Failed to fetch reward settings')
      }
    } catch (error) {
      toast.error('Error fetching reward settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize])

  const handleAddClick = () => {
    setEditingReward(null)
    setDialogOpen(true)
  }

  const handleEditClick = (reward) => {
    setEditingReward(reward)
    setDialogOpen(true)
  }

  const handleSave = async (id, formData) => {
    try {
      let res;
      if (id) {
        res = await updateAdReward(id, formData)
      } else {
        res = await createAdReward(formData)
      }

      if (res.ok && res.result.success) {
        toast.success(id ? 'AdsReward updated successfully' : 'AdsReward created successfully')
        setDialogOpen(false)
        fetchData()
      } else {
        toast.error(res.result.message || 'Failed to save AdsReward')
      }
    } catch (error) {
      toast.error('Error saving setting')
    }
  }

  const handleDelete = (id) => {
    toast(
      ({ closeToast }) => (
        <div className='flex flex-col gap-4'>
          <Typography variant='body1' className='font-medium'>
            Are you sure you want to delete this setting?
          </Typography>
          <div className='flex gap-2 justify-end'>
            <Button
              variant='contained'
              color='error'
              size='small'
              onClick={async () => {
                closeToast()
                try {
                  const { ok, result } = await deleteAdReward(id)
                  if (ok && result.success) {
                    toast.success('Setting deleted successfully')
                    fetchData()
                  } else {
                    toast.error(result.message || 'Failed to delete setting')
                  }
                } catch (error) {
                  toast.error('Error deleting setting')
                }
              }}
            >
              Yes, Delete
            </Button>
            <Button variant='tonal' color='secondary' size='small' onClick={closeToast}>
              Cancel
            </Button>
          </div>
        </div>
      ),
      { position: 'top-center', autoClose: false, closeButton: false }
    )
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
      columnHelper.accessor('adLabel', {
        header: 'AD Label',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.adLabel}
          </Typography>
        )
      }),
      columnHelper.accessor('adDisplayInterval', {
        header: 'Display Interval',
        cell: ({ row }) => <Typography>{row.original.adDisplayInterval}</Typography>
      }),
      columnHelper.accessor('coinEarnedFromAd', {
        header: 'Coins Earned',
        cell: ({ row }) => <Typography color='primary'>{row.original.coinEarnedFromAd}</Typography>
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <IconButton onClick={() => handleEditClick(row.original)} size='small'>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
            <IconButton onClick={() => handleDelete(row.original._id)} size='small'>
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
    rowCount, // ✅ Added rowCount for TablePaginationComponent
    state: {
      pagination,
    },
    manualPagination: true,
    pageCount: Math.ceil(rowCount / pagination.pageSize) || 1,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card>
      <CardHeader
        title='Ads Coin Reward '
        action={
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={handleAddClick}>
            Add AdsReward
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
                  <th key={header.id} className='uppercase'>
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
      <AdRewardDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        reward={editingReward}
        handleSave={handleSave}
      />
    </Card>
  )
}

export default AdRewardListTable
