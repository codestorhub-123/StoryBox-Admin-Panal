'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'

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
import CustomAvatar from '@core/components/mui/Avatar'

// Service Imports
import { getContentList, createContent, updateContent, deleteContent } from '@/services/ApiService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const ContentListTable = () => {
  // States
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  // Dialog States
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentContent, setCurrentContent] = useState(null)

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    icon: null,
    preview: ''
  })
  const [errors, setErrors] = useState({})

  const resetForm = () => {
    setFormData({ name: '', title: '', description: '', icon: null, preview: '' })
    setEditMode(false)
    setCurrentContent(null)
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
      const { ok, result } = await getContentList()

      if (ok && result.success) {
        setData(result.data)
      } else {
        toast.error(result.message || 'Failed to fetch content')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error fetching content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = (id) => {
    toast(
      ({ closeToast }) => (
        <div className='flex flex-col gap-4'>
          <Typography variant='body1' className='font-medium'>
            Are you sure you want to delete this content?
          </Typography>
          <div className='flex gap-2 justify-end'>
            <Button
              variant='contained'
              color='error'
              size='small'
              onClick={async () => {
                closeToast()
                try {
                  const { ok, result } = await deleteContent(id)
                  if (ok && result.success) {
                    toast.success('Content deleted successfully')
                    fetchData()
                  } else {
                    toast.error(result.message || 'Failed to delete content')
                  }
                } catch (error) {
                  toast.error('Error deleting content')
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

  const handleEdit = (content) => {
    setEditMode(true)
    setCurrentContent(content)
    setFormData({
      name: content.name,
      title: content.title,
      description: content.description,
      icon: null,
      preview: content.icon
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const submitData = new FormData()
    submitData.append('name', formData.name)
    submitData.append('title', formData.title)
    submitData.append('description', formData.description)
    if (formData.icon) submitData.append('icon', formData.icon)

    if (editMode) {
      try {
        const { ok, result } = await updateContent(currentContent._id, submitData)
        if (ok && result.success) {
          toast.success('Content updated successfully')
          fetchData()
          handleClose()
        } else {
          toast.error(result.message || 'Failed to update content')
        }
      } catch (err) {
        toast.error('Error updating content')
      }
    } else {
      try {
        const { ok, result } = await createContent(submitData)
        if (ok && result.success) {
          toast.success('Content created successfully')
          fetchData()
          handleClose()
        } else {
          toast.error(result.message || 'Failed to create content')
        }
      } catch (err) {
        toast.error('Error creating content')
      }
    }
  }

  const handleIconChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({
        ...formData,
        icon: file,
        preview: URL.createObjectURL(file)
      })
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'no',
        header: 'No.',
        cell: ({ row }) => <Typography variant='body2'>{row.index + 1}</Typography>
      }),
      columnHelper.accessor('icon', {
        header: 'Icon',
        cell: ({ row }) => {
          const baseUrl = process.env.NEXT_PUBLIC_URL.split('/api/v1')[0]
          const imgUrl = row.original.icon?.startsWith('http')
            ? row.original.icon
            : `${baseUrl}/${row.original.icon}`

          return <CustomAvatar src={imgUrl} size={40} variant='rounded' />
        }
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => <Typography color='text.primary' className='font-medium'>{row.original.name}</Typography>
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: ({ row }) => <Typography>{row.original.title}</Typography>
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: ({ row }) => <Typography>{new Date(row.original.createdAt).toLocaleDateString('en-GB')}</Typography>
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
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card>
      <CardHeader
        title='Content '
        action={
          <Button variant='contained' onClick={handleOpen} startIcon={<i className='tabler-plus' />}>
            Add Content
          </Button>
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
              <tr><td colSpan={columns.length} className='text-center p-6'><CircularProgress /></td></tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={columns.length} className='text-center p-6'>No content available</td></tr>
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
        <DialogTitle>{editMode ? 'Edit Content' : 'Add Content'}</DialogTitle>
        <DialogContent>
          <div className='flex flex-col gap-4 p-4'>
            <div className='flex items-center justify-center mb-4'>
              <div className='flex flex-col items-center gap-2'>
                <CustomAvatar src={formData.preview} size={80} variant='rounded' />
                <Button component='label' variant='outlined' size='small'>
                  Upload Icon
                  <input type='file' hidden accept='image/*' onChange={handleIconChange} />
                </Button>
              </div>
            </div>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label='Name (Internal)'
                  placeholder='e.g. Media_and_public_relations'
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) setErrors(prev => ({ ...prev, name: null }))
                  }}
                  error={!!errors.name}
                  helperText={errors.name}
                  autoComplete='off'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label='Title (Display)'
                  placeholder='e.g. Media & Public Relations'
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value })
                    if (errors.title) setErrors(prev => ({ ...prev, title: null }))
                  }}
                  error={!!errors.title}
                  helperText={errors.title}
                  autoComplete='off'
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={4}
                  label='Description'
                  placeholder='Content description...'
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value })
                    if (errors.description) setErrors(prev => ({ ...prev, description: null }))
                  }}
                  autoComplete='off'
                  error={!!errors.description}
                  helperText={errors.description}
                />
              </Grid>
            </Grid>
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

export default ContentListTable
