'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

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
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Rating from '@mui/material/Rating'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'

// Third-party Imports
import ReactPlayer from 'react-player'

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
import { getStories, createStory, updateStory, deleteStory, getCategories, getStoryDetail, createEpisode } from '@/services/ApiService'

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

const StoryListTable = () => {
  // Hooks
  const params = useParams()
  const { lang: locale } = params

  // States
  const [data, setData] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [rowCount, setRowCount] = useState(0)
  
  // Dialog States
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentStory, setCurrentStory] = useState(null)

  // Episode Dialog States
  const [episodeDialogOpen, setEpisodeDialogOpen] = useState(false)
  const [episodes, setEpisodes] = useState([])
  const [episodeLoading, setEpisodeLoading] = useState(false)
  const [selectedStoryTitle, setSelectedStoryTitle] = useState('')
  
  // Video Dialog States
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('')
  
  // Form States
  const [formData, setFormData] = useState({
      title: '',
      uniqueId: '',
      description: '',
      category: '',
      rating: 0,
      isExclusive: false,
      isCompleted: false,
      coverImage: null,
      bannerImage: null,
      coverPreview: '',
      bannerPreview: ''
  })

  // Add Episode States
  const [addEpisodeOpen, setAddEpisodeOpen] = useState(false)
  const [selectedStoryId, setSelectedStoryId] = useState('')
  const [episodeFormData, setEpisodeFormData] = useState({
      episodeNumber: '',
      name: '',
      description: '',
      isFree: true,
      type: 'episode',
      thumbnail: null,
      video: null,
      videoUrl: '',
      thumbnailPreview: '',
      coin: 0
  })
  const [editingEpisodeId, setEditingEpisodeId] = useState(null)
  const [isEpisodeEditMode, setIsEpisodeEditMode] = useState(false)

  // Format image helper
  const getImageUrl = (path) => {
      if (!path) return ''
      const baseUrl = process.env.NEXT_PUBLIC_URL.split('/api/v1')[0]
      return path.startsWith('http') ? path : `${baseUrl}/${path}`
  }

  const resetForm = () => {
      setFormData({
        title: '',
        uniqueId: '',
        description: '',
        category: '',
        rating: 0,
        isExclusive: false,
        isCompleted: false,
        coverImage: null,
        bannerImage: null,
        coverPreview: '',
        bannerPreview: ''
      })
      setEditMode(false)
      setCurrentStory(null)
  }

  const handleOpen = async () => {
      // Fetch categories if not already fetched
      if(categories.length === 0) {
        try {
            const { ok, result } = await getCategories({ limit: 100 })
            if(ok && result.success) {
                setCategories(result.data.docs)
            }
        } catch (error) {
            console.error('Error fetching categories')
        }
      }
      setOpen(true)
  }
  
  const handleClose = () => {
      setOpen(false)
      resetForm()
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const { ok, result } = await getStories({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      })

      if (ok && result.success) {
        setData(result.data.docs)
        setRowCount(result.data.totalDocs)
      } else {
        toast.error(result.message || 'Failed to fetch stories')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error fetching stories')
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
                    Are you sure you want to delete this story?
                </Typography>
                <div className='flex gap-2 justify-end'>
                     <Button 
                        variant='contained' 
                        color='error' 
                        size='small'
                        onClick={async () => {
                            closeToast()
                            try {
                                const { ok, result } = await deleteStory(id)
                                if(ok && result.success) {
                                    toast.success('Story deleted successfully')
                                    fetchData()
                                } else {
                                    toast.error(result.message || 'Failed to delete story')
                                }
                            } catch (error) {
                                toast.error('Error deleting story')
                            }
                        }}
                    >
                        Yes
                    </Button>
                    <Button 
                        variant='outlined' 
                        color='secondary' 
                        size='small'
                        onClick={closeToast}
                    >
                        No
                    </Button>
                </div>
            </div>
        ),
        {
            position: 'top-center',
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: false,
            icon: '👋'
        }
    )
  }

  const handleViewEpisodes = async (story) => {
    setSelectedStoryTitle(story.title)
    setSelectedStoryId(story._id)
    setEpisodeDialogOpen(true)
    setEpisodeLoading(true)
    try {
        const { ok, result } = await getStoryDetail(story._id)
        if(ok && result.success) {
            const fetchedEpisodes = result.data.episodes || []
            setEpisodes(fetchedEpisodes)
            
            // Calculate next episode number based on max existing number
            const maxEp = fetchedEpisodes.reduce((max, ep) => {
                const num = Number(ep.episodeNumber) || 0
                return num > max ? num : max
            }, 0)
            
            setEpisodeFormData(prev => ({
                ...prev, 
                episodeNumber: maxEp + 1,
                name: `Ep ${maxEp + 1}`,
                description: '',
                isFree: true,
                type: 'episode',
                videoUrl: '',
                video: null,
                thumbnail: null,
                thumbnailPreview: '',
                coin: 0
            }))
        } else {
            toast.error(result.message || 'Failed to fetch episodes')
        }
    } catch (error) {
        toast.error('Error fetching episodes')
    } finally {
        setEpisodeLoading(false)
    }
  }

  const handleAddEpisodeSubmit = async () => {
      if(!episodeFormData.name.trim()) return toast.error('Episode name is required')
      
      let finalThumbnail = episodeFormData.thumbnail

      // Auto-capture thumbnail if missing and video exists
      if(!finalThumbnail && episodeFormData.video) {
        try {
            const video = document.createElement('video')
            video.src = URL.createObjectURL(episodeFormData.video)
            video.muted = true
            await new Promise((resolve) => {
                video.onloadeddata = () => {
                    video.currentTime = 1
                    video.onseeked = () => {
                        const canvas = document.createElement('canvas')
                        canvas.width = 300
                        canvas.height = 400
                        const ctx = canvas.getContext('2d')
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                        canvas.toBlob((blob) => {
                            finalThumbnail = new File([blob], 'thumb.jpg', { type: 'image/jpeg' })
                            resolve()
                        }, 'image/jpeg')
                    }
                }
            })
        } catch (e) {
            console.error('Thumbnail capture failed', e)
        }
      }

      const submitData = new FormData()
      submitData.append('storyId', selectedStoryId)
      submitData.append('episodeNumber', episodeFormData.episodeNumber)
      submitData.append('name', episodeFormData.name)
      submitData.append('description', episodeFormData.description)
      submitData.append('isFree', episodeFormData.isFree)
      submitData.append('type', episodeFormData.type)
      submitData.append('coin', episodeFormData.coin)
      
      if(episodeFormData.videoUrl) submitData.append('videoUrl', episodeFormData.videoUrl)
      if(finalThumbnail) submitData.append('thumbnail', finalThumbnail)
      if(episodeFormData.video) submitData.append('video', episodeFormData.video)

      try {
          const { ok, result } = isEpisodeEditMode 
            ? await updateEpisode(editingEpisodeId, submitData)
            : await createEpisode(submitData)

          if(ok && result.success) {
              toast.success(`Episode ${isEpisodeEditMode ? 'updated' : 'added'} successfully`)
              setAddEpisodeOpen(false)
              setIsEpisodeEditMode(false)
              setEditingEpisodeId(null)
              
              // Refresh episodes list
              const storyRes = await getStoryDetail(selectedStoryId)
              if(storyRes.ok && storyRes.result.success) {
                  setEpisodes(storyRes.result.data.episodes || [])
              }
          } else {
              toast.error(result.message || 'Error occurred')
          }
      } catch (err) {
          toast.error('Operation failed')
      }
  }

  const handleEditEpisode = (episode) => {
      setIsEpisodeEditMode(true)
      setEditingEpisodeId(episode._id)
      setEpisodeFormData({
          episodeNumber: episode.episodeNumber,
          name: episode.name || '',
          description: episode.description || '',
          isFree: episode.isFree || false,
          type: episode.type || 'episode',
          thumbnail: null,
          video: null,
          videoUrl: episode.videoUrl || '',
          thumbnailPreview: getImageUrl(episode.thumbnail),
          coin: episode.coin || 0
      })
      setAddEpisodeOpen(true)
  }

  const handleDeleteEpisode = async (id) => {
      if(window.confirm('Are you sure you want to delete this episode?')) {
          try {
              const { ok, result } = await deleteEpisode(id)
              if(ok && result.success) {
                  toast.success('Episode deleted')
                  const storyRes = await getStoryDetail(selectedStoryId)
                  if(storyRes.ok && storyRes.result.success) {
                      setEpisodes(storyRes.result.data.episodes || [])
                  }
              }
          } catch (err) {
              toast.error('Delete failed')
          }
      }
  }

  const handleEpisodeFileChange = async (e, field) => {
      const file = e.target.files[0]
      if(file) {
          if(field === 'thumbnail') {
              setEpisodeFormData({
                  ...episodeFormData,
                  thumbnail: file,
                  thumbnailPreview: URL.createObjectURL(file)
              })
          } else {
              setEpisodeFormData(prev => ({ ...prev, video: file }))
              
              // Auto-capture preview if no thumbnail
              if(!episodeFormData.thumbnail) {
                  try {
                      const video = document.createElement('video')
                      video.src = URL.createObjectURL(file)
                      video.muted = true
                      video.onloadeddata = () => {
                          video.currentTime = 1
                          video.onseeked = () => {
                              const canvas = document.createElement('canvas')
                              canvas.width = 300
                              canvas.height = 400
                              const ctx = canvas.getContext('2d')
                              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                              const previewUrl = canvas.toDataURL('image/jpeg')
                              setEpisodeFormData(prev => ({
                                  ...prev,
                                  thumbnailPreview: previewUrl
                              }))
                          }
                      }
                  } catch (err) {
                      console.error('Preview capture failed', err)
                  }
              }
          }
      }
  }

  const handlePlayVideo = (videoUrl) => {
      setSelectedVideoUrl(getImageUrl(videoUrl))
      setVideoDialogOpen(true)
  }

  const handleEdit = async (story) => {
      setEditMode(true)
      setCurrentStory(story)
      
       // Fetch categories if not already fetched
       if(categories.length === 0) {
        try {
            const { ok, result } = await getCategories({ limit: 100 })
            if(ok && result.success) {
                setCategories(result.data.docs)
            }
        } catch (error) {
            console.error('Error fetching categories')
        }
      }

      setFormData({
          title: story.title,
          uniqueId: story.uniqueId,
          description: story.description,
          category: story.category?._id || '',
          rating: story.rating || 0,
          isExclusive: story.isExclusive || false,
          isCompleted: story.isCompleted || false,
          coverImage: null,
          bannerImage: null,
          coverPreview: getImageUrl(story.coverImage),
          bannerPreview: getImageUrl(story.bannerImage)
      })
      setOpen(true)
  }

  const handleSubmit = async () => {
      if(!formData.title.trim()) return toast.error('Title is required')
      if(!formData.category) return toast.error('Category is required')
      
      const submitData = new FormData()
      
      submitData.append('title', formData.title)
      submitData.append('uniqueId', formData.uniqueId) // Assuming backend handles uniqueness or updates
      submitData.append('description', formData.description)
      submitData.append('category', formData.category)
      submitData.append('rating', formData.rating)
      submitData.append('isExclusive', formData.isExclusive)
      submitData.append('isCompleted', formData.isCompleted)
      
      if(formData.coverImage) submitData.append('coverImage', formData.coverImage)
      if(formData.bannerImage) submitData.append('bannerImage', formData.bannerImage)

      if(editMode) {
          try {
              const { ok, result } = await updateStory(currentStory._id, submitData)
              if(ok && result.success) {
                  toast.success('Story updated successfully')
                  fetchData()
                  handleClose()
              } else {
                  toast.error(result.message || 'Failed to update story')
              }
          } catch(err) {
              toast.error('Error updating story')
          }
      } else {
          try {
              const { ok, result } = await createStory(submitData)
              if(ok && result.success) {
                  toast.success('Story created successfully')
                  fetchData()
                  handleClose()
              } else {
                  toast.error(result.message || 'Failed to create story')
              }
          } catch(err) {
               toast.error('Error creating story')
          }
      }
  }

  const handleFileChange = (e, field) => {
      const file = e.target.files[0]
      if(file) {
          setFormData({
              ...formData,
              [field]: file,
              [field === 'coverImage' ? 'coverPreview' : 'bannerPreview']: URL.createObjectURL(file)
          })
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
      columnHelper.accessor('coverImage', {
        header: 'Cover',
        cell: ({ row }) => (
             <CustomAvatar src={getImageUrl(row.original.coverImage)} size={50} variant='rounded' />
        )
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: ({ row }) => (
            <Typography color='text.primary' className='font-medium'>
                {row.original.title}
            </Typography>
        )
      }),
    //    columnHelper.accessor('description', {
    //     header: 'Description',
    //     cell: ({ row }) => (
    //         <Typography color='text.primary' className='font-medium'>
    //             {row.original.description}
    //         </Typography>
    //     )
    //   }),
       columnHelper.accessor('uniqueId', {
        header: 'Unique ID',
        cell: ({ row }) => (
            <Typography variant='body2'>{row.original.uniqueId}</Typography>
        )
      }),
      columnHelper.accessor('category', {
          header: 'Category',
          cell: ({ row }) => (
            <Typography variant='body2'>{row.original.category?.name || '-'}</Typography>
          )
      }),
      columnHelper.accessor('episodes', {
          header: 'Episodes',
          cell: ({ row }) => (
             <div className='flex flex-col items-center gap-1'>
                 <div className='flex items-center gap-1'>
                    {row.original.isCompleted && <i className='tabler-check text-success text-xs' title='Completed' />}
                    <Typography variant='body2' className='font-medium'>{row.original.totalEpisodes || 0}</Typography>
                 </div>
                  <Button 
                    size='extra-small' 
                    variant='tonal' 
                    className='py-0.5 px-2 text-[10px]'
                    component={Link}
                    href={`/${locale}/apps/story/episodes/${row.original._id}`}
                  >
                    View
                  </Button>
             </div>
          )
      }),
      columnHelper.accessor('rating', {
          header: 'Rating',
          cell: ({ row }) => (
             <div className='flex items-center'>
                 <i className='tabler-star-filled text-warning text-xs mie-1' />
                 <Typography variant='body2'>{row.original.rating}</Typography>
             </div>
          )
      }),
       columnHelper.accessor('totalViews', {
          header: 'Views',
          cell: ({ row }) => (
            <Typography variant='body2'>{row.original.totalViews || 0}</Typography>
          )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: ({ row }) => (
            <Typography variant='body2'>
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
        title='Stories' 
        action={
            <Button variant='contained' onClick={handleOpen} startIcon={<i className='tabler-plus' />}>
                Add Story
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
          <DialogTitle>{editMode ? 'Edit Story' : 'Add Story'}</DialogTitle>
          <DialogContent>
              <div className='flex flex-col gap-4 p-4'>
                  <div className='flex gap-4'>
                      <div className='flex-1 flex flex-col items-center gap-2'>
                        <Typography variant='caption'>Cover Image</Typography>
                        <CustomAvatar src={formData.coverPreview} size={100} variant='rounded' />
                        <Button component='label' variant='outlined' size='small'>
                            Upload
                            <input type='file' hidden accept='image/*' onChange={(e) => handleFileChange(e, 'coverImage')} />
                        </Button>
                      </div>
                      <div className='flex-1 flex flex-col items-center gap-2'>
                        <Typography variant='caption'>Banner Image</Typography>
                        <CustomAvatar src={formData.bannerPreview} size={100} variant='rounded' className='is-full' />
                        <Button component='label' variant='outlined' size='small'>
                            Upload
                            <input type='file' hidden accept='image/*' onChange={(e) => handleFileChange(e, 'bannerImage')} />
                        </Button>
                      </div>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <CustomTextField
                        fullWidth
                        label='Story Title'
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                     <CustomTextField
                        fullWidth
                        label='Unique ID'
                        value={formData.uniqueId}
                        onChange={(e) => setFormData({...formData, uniqueId: e.target.value})}
                    />
                    <CustomTextField
                        select
                        fullWidth
                        label='Category'
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                        {categories.map((cat) => (
                            <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                        ))}
                    </CustomTextField>
                     <div className='flex items-center gap-4'>
                         <Typography>Rating</Typography>
                         <Rating 
                            value={Number(formData.rating)} 
                            precision={0.5} 
                            onChange={(e, newValue) => setFormData({...formData, rating: newValue})}
                         />
                     </div>
                  </div>

                  <CustomTextField
                    fullWidth
                    multiline
                    rows={3}
                    label='Description'
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                  
                  <div className='flex gap-4'>
                      <FormControlLabel
                        control={
                            <Switch 
                                checked={formData.isExclusive} 
                                onChange={(e) => setFormData({...formData, isExclusive: e.target.checked})} 
                            />
                        }
                        label="Exclusive"
                      />
                       <FormControlLabel
                        control={
                            <Switch 
                                checked={formData.isCompleted} 
                                onChange={(e) => setFormData({...formData, isCompleted: e.target.checked})} 
                            />
                        }
                        label="Completed"
                      />
                  </div>
              </div>
          </DialogContent>
          <DialogActions>
              <Button onClick={handleClose} color='secondary'>Cancel</Button>
              <Button onClick={handleSubmit} variant='contained'>{editMode ? 'Update' : 'Create'}</Button>
          </DialogActions>
      </Dialog>

      {/* Episodes Dialog */}
      <Dialog 
        open={episodeDialogOpen} 
        onClose={() => setEpisodeDialogOpen(false)} 
        fullWidth 
        maxWidth='lg'
      >
          <DialogTitle className='flex justify-between items-center p-6 pb-2'>
              <Typography variant='h5' className='font-semibold'>Short Videos - {selectedStoryTitle}</Typography>
              <div className='flex items-center gap-4'>
                <Button 
                    variant='contained' 
                    size='small' 
                    startIcon={<i className='tabler-plus' />}
                    onClick={() => setAddEpisodeOpen(true)}
                >
                    Add Episode
                </Button>
                <IconButton onClick={() => setEpisodeDialogOpen(false)}>
                    <i className='tabler-x' />
                </IconButton>
              </div>
          </DialogTitle>
          <DialogContent className='p-6'>
               <div className='overflow-x-auto rounded-lg border'>
                    <table className={classnames(tableStyles.table)}>
                        <thead>
                            <tr className='bg-backgroundDefault'>
                                <th className='font-bold uppercase text-[11px] p-4 border-b'>NO</th>
                                <th className='font-bold uppercase text-[11px] p-4 border-b'>VIDEO IMAGE</th>
                                <th className='font-bold uppercase text-[11px] p-4 border-b text-left'>EPISODE NAME</th>
                                <th className='font-bold uppercase text-[11px] p-4 border-b text-center'>EPISODE NO</th>
                                <th className='font-bold uppercase text-[11px] p-4 border-b'>LOCKED STATUS</th>
                                <th className='font-bold uppercase text-[11px] p-4 border-b'>COIN</th>
                                <th className='font-bold uppercase text-[11px] p-4 border-b'>DATE</th>
                                <th className='font-bold uppercase text-[11px] p-4 border-b'>VIEW VIDEO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {episodeLoading ? (
                                <tr>
                                    <td colSpan={9} className='text-center p-16'>
                                        <CircularProgress size={40} />
                                    </td>
                                </tr>
                            ) : episodes.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className='text-center p-8'>No episodes found</td>
                                </tr>
                            ) : (
                                episodes.map((episode, index) => (
                                    <tr key={episode._id} className='hover:bg-actionHover transition-colors'>
                                        <td className='p-4 border-b'><Typography>{index + 1}</Typography></td>
                                        <td className='p-4 border-b'>
                                            <img 
                                                src={getImageUrl(episode.thumbnail)} 
                                                alt='' 
                                                className='w-[60px] h-[80px] object-cover rounded-lg shadow-sm'
                                            />
                                        </td>
                                        <td className='p-4 border-b'>
                                            <Typography className='font-medium text-primary'>
                                                {episode.name || '-'}
                                            </Typography>
                                            <Typography variant='caption' className='block'>
                                                {episode.type?.toUpperCase()}
                                            </Typography>
                                        </td>
                                        <td className='p-4 border-b text-center'>
                                            <Typography className='font-medium'>
                                                {episode.type === 'trailer' ? 'Trailer' : episode.episodeNumber}
                                            </Typography>
                                        </td>
                                        <td className='p-4 border-b text-center'>
                                            <i className={classnames(
                                                episode.isLocked ? 'tabler-lock text-error' : 'tabler-lock-open text-success',
                                                'text-2xl'
                                            )} />
                                        </td>
                                        <td className='p-4 border-b text-center'><Typography>{episode.coin || 0}</Typography></td>
                                        <td className='p-4 border-b'><Typography>{new Date(episode.createdAt).toLocaleDateString('en-GB')}</Typography></td>
                                        <td className='p-4 border-b text-center'>
                                            <div className='flex items-center justify-center gap-1'>
                                                <IconButton 
                                                    size='small' 
                                                    onClick={() => handlePlayVideo(episode.videoUrl)}
                                                    className='text-primary'
                                                >
                                                    <i className='tabler-eye text-lg' />
                                                </IconButton>
                                                <IconButton 
                                                    size='small' 
                                                    onClick={() => handleEditEpisode(episode)}
                                                    className='text-info'
                                                >
                                                    <i className='tabler-edit text-lg' />
                                                </IconButton>
                                                <IconButton 
                                                    size='small' 
                                                    onClick={() => handleDeleteEpisode(episode._id)}
                                                    className='text-error'
                                                >
                                                    <i className='tabler-trash text-lg' />
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {!episodeLoading && episodes.length > 0 && (
                        <div className='p-4 text-center bg-backgroundDefault border-t'>
                            <Typography variant='body2' color='textSecondary' className='italic'>
                                No more episodes to load
                            </Typography>
                        </div>
                    )}
               </div>
          </DialogContent>
          <DialogActions className='p-6 pt-0'>
              <Button onClick={() => setEpisodeDialogOpen(false)} variant='tonal' color='secondary' className='rounded-md'>
                  Close
              </Button>
          </DialogActions>
      </Dialog>

      {/* Video Player Dialog */}
      <Dialog 
        open={videoDialogOpen} 
        onClose={() => setVideoDialogOpen(false)} 
        maxWidth='md' 
        fullWidth
      >
          <DialogTitle className='flex justify-between items-center'>
              <Typography variant='h6'>Video Player</Typography>
              <IconButton onClick={() => setVideoDialogOpen(false)}>
                  <i className='tabler-x' />
              </IconButton>
          </DialogTitle>
          <DialogContent className='p-0 bg-black flex justify-center items-center overflow-hidden'>
              <div className='aspect-video w-full'>
                <ReactPlayer 
                    url={selectedVideoUrl} 
                    controls 
                    width='100%' 
                    height='100%' 
                    playing={videoDialogOpen}
                />
              </div>
          </DialogContent>
      </Dialog>

      {/* Add Episode Dialog */}
      <Dialog open={addEpisodeOpen} onClose={() => {setAddEpisodeOpen(false); setIsEpisodeEditMode(false);}} fullWidth maxWidth='md'>
          <DialogTitle>{isEpisodeEditMode ? 'Edit Episode' : `Add New Episode to ${selectedStoryTitle}`}</DialogTitle>
          <DialogContent>
              <div className='flex flex-col gap-4 p-4'>
                  <div className='flex gap-4 justify-center'>
                      <div className='flex flex-col items-center gap-2 text-center'>
                        <Typography variant='caption'>Thumbnail (Optional - can auto-extract from video)</Typography>
                        <CustomAvatar src={episodeFormData.thumbnailPreview} size={100} variant='rounded' />
                        <Button component='label' variant='outlined' size='small'>
                            Upload Image
                            <input type='file' hidden accept='image/*' onChange={(e) => handleEpisodeFileChange(e, 'thumbnail')} />
                        </Button>
                      </div>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <CustomTextField
                        fullWidth
                        label='Episode Name'
                        value={episodeFormData.name}
                        onChange={(e) => setEpisodeFormData({...episodeFormData, name: e.target.value})}
                    />
                     <CustomTextField
                        fullWidth
                        type='number'
                        label='Episode Number'
                        value={episodeFormData.episodeNumber}
                        onChange={(e) => setEpisodeFormData({...episodeFormData, episodeNumber: e.target.value})}
                    />
                      <CustomTextField
                        fullWidth
                        type='number'
                        label='Coin'
                        value={episodeFormData.coin}
                        onChange={(e) => setEpisodeFormData({...episodeFormData, coin: e.target.value})}
                    />
                     <div className='flex items-center gap-4'>
                       <FormControl component="fieldset">
                        <FormLabel component="legend">Type</FormLabel>
                        <RadioGroup 
                            row 
                            value={episodeFormData.type} 
                            onChange={(e) => setEpisodeFormData({...episodeFormData, type: e.target.value})}
                        >
                            <FormControlLabel value="episode" control={<Radio />} label="Episode" />
                            <FormControlLabel value="trailer" control={<Radio />} label="Trailer" />
                        </RadioGroup>
                      </FormControl>
                    </div>
                  </div>

                  <CustomTextField
                    fullWidth
                    multiline
                    rows={2}
                    label='Description'
                    value={episodeFormData.description}
                    onChange={(e) => setEpisodeFormData({...episodeFormData, description: e.target.value})}
                  />
                  
                  <div className='flex flex-col gap-2 p-3 border rounded-lg bg-actionHover'>
                       <Typography variant='subtitle2' className='font-semibold'>Video Content</Typography>
                       <div className='flex gap-4 items-center'>
                            <Button component='label' variant='contained' size='small' color='secondary'>
                                Upload Video File
                                <input type='file' hidden accept='video/*' onChange={(e) => handleEpisodeFileChange(e, 'video')} />
                            </Button>
                            <Typography variant='caption'>{episodeFormData.video ? episodeFormData.video.name : 'No file selected'}</Typography>
                       </div>
                       <Typography variant='caption' className='text-center my-1'>- OR -</Typography>
                       <CustomTextField
                            fullWidth
                            label='Video URL (External Link)'
                            placeholder='https://...'
                            value={episodeFormData.videoUrl}
                            onChange={(e) => setEpisodeFormData({...episodeFormData, videoUrl: e.target.value})}
                        />
                  </div>

                  <FormControlLabel
                    control={
                        <Switch 
                            checked={episodeFormData.isFree} 
                            onChange={(e) => setEpisodeFormData({...episodeFormData, isFree: e.target.checked})} 
                        />
                    }
                    label="Free"
                  />
              </div>
          </DialogContent>
          <DialogActions className='px-8 pb-8'>
              <Button onClick={() => setAddEpisodeOpen(false)} color='secondary'>Cancel</Button>
              <Button onClick={handleAddEpisodeSubmit} variant='contained' className='min-is-[100px]'>Add Episode</Button>
          </DialogActions>
      </Dialog>
    </Card>
  )
}

export default StoryListTable
