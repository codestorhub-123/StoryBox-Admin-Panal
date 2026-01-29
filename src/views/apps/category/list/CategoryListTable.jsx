'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'

// Third-party Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { toast } from 'react-toastify'
import classnames from 'classnames'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Service Imports
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/ApiService'

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

const columnHelper = createColumnHelper()

const CategoryListTable = () => {
  // States
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [rowCount, setRowCount] = useState(0)
  const [globalFilter, setGlobalFilter] = useState('')

  // Dialog States
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    preview: ''
  })

  const [errors, setErrors] = useState({})

  const resetForm = () => {
    setFormData({ name: '', image: null, preview: '' })
    setEditMode(false)
    setCurrentCategory(null)
    setErrors({})
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    resetForm()
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const { ok, result } = await getCategories({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        // search: globalFilter // API might not support search yet based on prompt, but keeping logic
      })

      if (ok && result.success) {
        setData(result.data.docs)
        setRowCount(result.data.totalDocs)
      } else {
        toast.error(result.message || 'Failed to fetch categories')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error fetching categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize])

  const handleDelete = (id) => {
    toast(
      ({ closeToast }) => (
        <div className='flex flex-col gap-4'>
          <Typography variant='body1' className='font-medium'>
            Are you sure you want to delete this category?
          </Typography>
          <div className='flex gap-2 justify-end'>
            <Button
              variant='contained'
              color='error'
              size='small'
              onClick={async () => {
                closeToast()
                try {
                  const { ok, result } = await deleteCategory(id)
                  if (ok && result.success) {
                    toast.success('Category deleted successfully')
                    fetchData()
                  } else {
                    toast.error(result.message || 'Failed to delete category')
                  }
                } catch (error) {
                  toast.error('Error deleting category')
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

  const handleEdit = (category) => {
    setEditMode(true)
    setCurrentCategory(category)
    setFormData({
      name: category.name,
      image: null,
      preview: category.image
    })
    setErrors({})
    setOpen(true)
  }

  const handleSubmit = async () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const submitData = new FormData()

    if (editMode) {
      // Update
      if (formData.name !== currentCategory.name) submitData.append('name', formData.name)
      if (formData.image) submitData.append('image', formData.image)

      // If no changes
      if (!formData.image && formData.name === currentCategory.name) {
        handleClose()
        return
      }

      try {
        const { ok, result } = await updateCategory(currentCategory._id, submitData)
        if (ok && result.success) {
          toast.success('Category updated successfully')
          fetchData()
          handleClose()
        } else {
          toast.error(result.message || 'Failed to update category')
        }
      } catch (err) {
        toast.error('Error updating category')
      }
    } else {
      // Create
      submitData.append('name', formData.name)
      if (formData.image) submitData.append('image', formData.image)

      try {
        const { ok, result } = await createCategory(submitData)
        if (ok && result.success) {
          toast.success('Category created successfully')
          fetchData()
          handleClose()
        } else {
          toast.error(result.message || 'Failed to create category')
        }
      } catch (err) {
        toast.error('Error creating category')
      }
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({
        ...formData,
        image: file,
        preview: URL.createObjectURL(file)
      })
    }
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'no',
        header: 'No.',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {(pagination.pageIndex * pagination.pageSize) + row.index + 1}
          </Typography>
        )
      }),
      columnHelper.accessor('image', {
        header: 'Category Image',
        cell: ({ row }) => {
          const baseUrl = process.env.NEXT_PUBLIC_URL.split('/api/v1')[0]
          const imgUrl = row.original.image?.startsWith('http')
            ? row.original.image
            : `${baseUrl}/${row.original.image}`

          return <CustomAvatar src={imgUrl} size={50} variant='rounded' />
        }
      }),
      columnHelper.accessor('name', {
        header: 'Category Name',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('totalStories', {
        header: 'Total Movies',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <i className='tabler-movie text-textSecondary' />
            <Typography>{row.original.totalStories || 0}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: ({ row }) => (
          <Typography>
            {new Date(row.original.createdAt).toLocaleDateString('en-GB')}
          </Typography>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleEdit(row.original)}>
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

  return (
    <Card>
      <CardHeader
        title='Categories'
        action={
          <Button variant='contained' onClick={handleOpen} startIcon={<i className='tabler-plus' />}>
            Add Category
          </Button>
        }
        className='pbe-4'
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>{editMode ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <div className='flex flex-col gap-4 p-4'>
            <div className='flex items-center justify-center mb-4'>
              <div className='flex flex-col items-center gap-2'>
                <CustomAvatar src={formData.preview} size={100} variant='rounded' />
                <Button component='label' variant='outlined' size='small'>
                  Upload Image
                  <input type='file' hidden accept='image/*' onChange={handleImageChange} />
                </Button>
              </div>
            </div>
            <CustomTextField
              fullWidth
              label='Category Name'
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>Cancel</Button>
          <Button onClick={handleSubmit} variant='contained'>{editMode ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default CategoryListTable
