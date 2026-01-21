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
import Switch from '@mui/material/Switch'

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
import LanguageDialog from '@/components/dialogs/LanguageDialog'

// Service Imports
import { getLanguages, createLanguage, updateLanguage, deleteLanguage } from '@/services/ApiService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const LanguageListTable = () => {
  // States
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [rowCount, setRowCount] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLanguage, setEditingLanguage] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { ok, result } = await getLanguages({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
      })

      if (ok && result.success) {
        setData(result.data.docs)
        setRowCount(result.data.totalDocs)
      } else {
        toast.error(result.message || 'Failed to fetch languages')
      }
    } catch (error) {
      toast.error('Error fetching languages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize])

  const handleAddClick = () => {
    setEditingLanguage(null)
    setDialogOpen(true)
  }

  const handleEditClick = (language) => {
    setEditingLanguage(language)
    setDialogOpen(true)
  }

  const handleSave = async (id, formData) => {
    try {
      let res;
      if (id) {
        res = await updateLanguage(id, formData)
      } else {
        res = await createLanguage(formData)
      }

      if (res.ok && res.result.success) {
        toast.success(id ? 'Language updated successfully' : 'Language created successfully')
        setDialogOpen(false)
        fetchData()
      } else {
        toast.error(res.result.message || 'Failed to save language')
      }
    } catch (error) {
      toast.error('Error saving language')
    }
  }

  const handleDelete = (id) => {
    toast(
        ({ closeToast }) => (
            <div className='flex flex-col gap-4'>
                <Typography variant='body1' className='font-medium'>
                    Are you sure you want to delete this language?
                </Typography>
                <div className='flex gap-2 justify-end'>
                     <Button 
                        variant='contained' 
                        color='error' 
                        size='small'
                        onClick={async () => {
                            closeToast()
                            try {
                                const { ok, result } = await deleteLanguage(id)
                                if(ok && result.success) {
                                    toast.success('Language deleted successfully')
                                    fetchData()
                                } else {
                                    toast.error(result.message || 'Failed to delete language')
                                }
                            } catch (error) {
                                toast.error('Error deleting language')
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

  const handleToggleStatus = async (id, currentStatus) => {
      try {
          const { ok, result } = await updateLanguage(id, { isActive: !currentStatus })
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
        header: 'Language Name',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.name}
          </Typography>
        )
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
        title='Languages' 
        action={
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={handleAddClick}>
            Add Language
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
      <LanguageDialog 
        open={dialogOpen} 
        setOpen={setDialogOpen} 
        language={editingLanguage} 
        handleSave={handleSave} 
      />
    </Card>
  )
}

export default LanguageListTable
