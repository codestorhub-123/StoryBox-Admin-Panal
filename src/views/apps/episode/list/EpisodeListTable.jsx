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
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Chip from '@mui/material/Chip'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

// Third-party Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { toast } from 'react-toastify'
import ReactPlayer from 'react-player'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Service Imports
import { getEpisodes, getStories, deleteEpisode, createEpisode, updateEpisode } from '@/services/ApiService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const VideoThumbnail = ({ videoUrl, thumbnailUrl, getImageUrl, onClick }) => {
    const [thumb, setThumb] = useState(thumbnailUrl ? getImageUrl(thumbnailUrl) : '')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!thumbnailUrl && videoUrl) {
            setLoading(true)
            const video = document.createElement('video')
            video.src = getImageUrl(videoUrl)
            video.crossOrigin = 'anonymous'
            video.currentTime = 1 
            
            video.onloadeddata = () => {
                const canvas = document.createElement('canvas')
                canvas.width = 120
                canvas.height = 160
                const ctx = canvas.getContext('2d')
                
                setTimeout(() => {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                    setThumb(canvas.toDataURL('image/jpeg'))
                    setLoading(false)
                }, 500)
            }

            video.onerror = () => {
                setLoading(false)
            }
        }
    }, [videoUrl, thumbnailUrl, getImageUrl])

    if (loading) return <div className='w-[50px] h-[50px] bg-actionSelected animate-pulse rounded flex items-center justify-center'><CircularProgress size={16} /></div>
    
    return (
        <div className='relative group cursor-pointer' onClick={onClick}>
            <CustomAvatar src={thumb || '/images/avatars/1.png'} size={50} variant='rounded' />
            <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded'>
                <i className='tabler-player-play-filled text-white text-xs' />
            </div>
        </div>
    )
}

const GlobalEpisodeListTable = () => {
  // States
  const [data, setData] = useState([])
  const [stories, setStories] = useState([])
  const [selectedStory, setSelectedStory] = useState('all')
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [rowCount, setRowCount] = useState(0)

  // Video Dialog States
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('')

  // Form/Dialog States
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentEpisode, setCurrentEpisode] = useState(null)
  const [formData, setFormData] = useState({
      storyId: '',
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

  // Format image helper
  const getImageUrl = (path) => {
    if (!path) return ''
    const baseUrl = process.env.NEXT_PUBLIC_URL.split('/api/v1')[0]
    return path.startsWith('http') ? path : `${baseUrl}/${path}`
  }

  const fetchStories = async () => {
    try {
      const { ok, result } = await getStories({ limit: 100 })
      if (ok && result.success) {
        setStories(result.data.docs)
        setSelectedStory('all')
      }
    } catch (error) {
      console.error('Error fetching stories')
    }
  }

  const resetForm = () => {
    setFormData({
        storyId: '',
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
    setEditMode(false)
    setCurrentEpisode(null)
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
      setOpen(false)
      resetForm()
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      }
      
      // Case 1: If specific story selected, send storyId
      // Case 2: If 'all' or empty, don't send storyId
      if(selectedStory && selectedStory !== 'all') {
          params.storyId = selectedStory
      }

      const { ok, result } = await getEpisodes(params)

      if (ok && result.success) {
        setData(result.data.docs)
        setRowCount(result.data.totalDocs)
      } else {
        toast.error(result.message || 'Failed to fetch episodes')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error fetching episodes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  useEffect(() => {
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize, selectedStory])

  const handleDelete = (id) => {
    toast(
      ({ closeToast }) => (
        <div className='flex flex-col gap-4 text-center p-2'>
          <Typography variant='body1' className='font-medium'>
            Are you sure you want to delete this episode?
          </Typography>
          <div className='flex gap-2 justify-center'>
            <Button 
                variant='contained' 
                color='error' 
                size='small'
                onClick={async () => {
                    closeToast()
                    try {
                        const { ok, result } = await deleteEpisode(id)
                        if(ok && result.success) {
                            toast.success('Episode deleted successfully')
                            fetchData()
                        } else {
                            toast.error(result.message || 'Failed to delete episode')
                        }
                    } catch (error) {
                        toast.error('Error deleting episode')
                    }
                }}
            >
                Yes
            </Button>
            <Button variant='outlined' color='secondary' size='small' onClick={closeToast}>No</Button>
          </div>
        </div>
      ),
      { position: 'top-center', autoClose: false, closeButton: false }
    )
  }

  const handlePlayVideo = (videoUrl) => {
    setSelectedVideoUrl(getImageUrl(videoUrl))
    setVideoDialogOpen(true)
  }

  const handleEdit = (episode) => {
    setEditMode(true)
    setCurrentEpisode(episode)
    setFormData({
        storyId: episode.story?._id || episode.story || '',
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
    setOpen(true)
}

const handleSubmit = async () => {
    if(!formData.storyId) return toast.error('Story is required')
    if(!formData.name.trim()) return toast.error('Name is required')
    
    let finalThumbnail = formData.thumbnail

    // Auto-capture thumbnail from video if missing
    if(!finalThumbnail && formData.video) {
        try {
            const video = document.createElement('video')
            video.src = URL.createObjectURL(formData.video)
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
            console.error('Thumbnail capture error', e)
        }
    }

    const submitData = new FormData()
    
    submitData.append('storyId', formData.storyId)
    submitData.append('episodeNumber', formData.episodeNumber)
    submitData.append('name', formData.name)
    submitData.append('description', formData.description)
    submitData.append('isFree', formData.isFree)
    submitData.append('type', formData.type)
    submitData.append('coin', formData.coin)
    
    if(formData.videoUrl) submitData.append('videoUrl', formData.videoUrl)
    if(finalThumbnail) submitData.append('thumbnail', finalThumbnail)
    if(formData.video) submitData.append('video', formData.video)

    if(editMode) {
        try {
            const { ok, result } = await updateEpisode(currentEpisode._id, submitData)
            if(ok && result.success) {
                toast.success('Episode updated successfully')
                fetchData()
                handleClose()
            } else {
                toast.error(result.message || 'Failed to update episode')
            }
        } catch(err) {
            toast.error('Error updating episode')
        }
    } else {
        try {
            const { ok, result } = await createEpisode(submitData)
            if(ok && result.success) {
                toast.success('Episode created successfully')
                fetchData()
                handleClose()
            } else {
                toast.error(result.message || 'Failed to create episode')
            }
        } catch(err) {
             toast.error('Error creating episode')
        }
    }
}

const handleFileChange = async (e, field) => {
    const file = e.target.files[0]
    if(file) {
        if(field === 'thumbnail') {
          setFormData({
              ...formData,
              thumbnail: file,
              thumbnailPreview: URL.createObjectURL(file)
          })
        } else {
          setFormData(prev => ({ ...prev, video: file }))
          
          // Auto-capture preview
          if(!formData.thumbnail) {
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
                        setFormData(prev => ({
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

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'no',
        header: 'No.',
        cell: ({ row }) => <Typography variant='body2'>{(pagination.pageIndex * pagination.pageSize) + row.index + 1}</Typography>
      }),
      columnHelper.accessor('thumbnail', {
        header: 'Thumbnail',
        cell: ({ row }) => (
            <VideoThumbnail 
                videoUrl={row.original.videoUrl} 
                thumbnailUrl={row.original.thumbnail} 
                getImageUrl={getImageUrl} 
                onClick={() => handlePlayVideo(row.original.videoUrl)}
            />
        )
      }),
      columnHelper.display({
        id: 'Video',
        header: 'Video',
        cell: ({ row }) => (
            <div 
                className='w-[120px] h-[68px] relative rounded-lg overflow-hidden cursor-pointer shadow-sm border-2 border-transparent hover:border-primary transition-all group bg-black flex items-center justify-center'
                onClick={() => handlePlayVideo(row.original.videoUrl)}
            >
                <video 
                    src={getImageUrl(row.original.videoUrl)} 
                    className='w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity'
                    muted
                    loop
                    onMouseOver={e => e.target.play()}
                    onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                />
                <div className='absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-all'>
                     <div className='w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform'>
                        <i className='tabler-player-play-filled text-white text-xs' />
                     </div>
                </div>
            </div>
        )
      }),
      columnHelper.accessor('name', {
        header: 'Episode Name',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography color='text.primary' className='font-medium'>{row.original.name || 'No Name'}</Typography>
            <Typography variant='caption' className='text-xs'>{row.original.type?.toUpperCase()}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('episodeNumber', {
        header: 'Ep. No',
        cell: ({ row }) => <Typography variant='body2' className='font-semibold'>{row.original.type === 'trailer' ? 'Trailer' : row.original.episodeNumber}</Typography>
      }),
      columnHelper.accessor('isFree', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            {row.original.isFree ? <i className='tabler-lock-open text-success' /> : <i className='tabler-lock text-error' />}
            <Chip label={`${row.original.coin || 0} Coin`} size='small' variant='tonal' color={row.original.isFree ? 'success' : 'warning'} className='text-[10px] h-5' />
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <IconButton onClick={() => handleEdit(row.original)} size='small'>
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
    state: { pagination },
    manualPagination: true,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card>
      <CardHeader 
        title='Episode Management' 
        action={
            <div className='flex gap-4'>
               
                <CustomTextField
                    select
                    value={selectedStory}
                    onChange={(e) => setSelectedStory(e.target.value)}
                    className='is-[250px]'
                    label='Filter by Story'
                >
                    <MenuItem value='all'>All Stories</MenuItem>
                    {stories.map(story => (
                        <MenuItem key={story._id} value={story._id}>{story.title}</MenuItem>
                    ))}
                </CustomTextField>
            </div>
        }
      />
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length} className='text-center p-6'><CircularProgress /></td></tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={columns.length} className='text-center p-6 text-textDisabled'>No episodes found for this story</td></tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>{row.getVisibleCells().map(cell => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>
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
        onPageChange={(_, page) => table.setPageIndex(page)}
      />

       {/* Add/Edit Episode Dialog */}
       <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
          <DialogTitle>{editMode ? 'Edit Episode' : 'Add Episode'}</DialogTitle>
          <DialogContent>
              <div className='flex flex-col gap-4 p-4'>
                  <div className='flex gap-4 justify-center'>
                      <div className='flex flex-col items-center gap-2'>
                        <Typography variant='caption'>Thumbnail</Typography>
                        <Button component='label' variant='outlined' size='small'>
                            Upload
                            <input type='file' hidden accept='image/*' onChange={(e) => handleFileChange(e, 'thumbnail')} />
                        </Button>
                      </div>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <CustomTextField
                        select
                        fullWidth
                        label='Select Story'
                        value={formData.storyId}
                        onChange={(e) => setFormData({...formData, storyId: e.target.value})}
                    >
                        {stories.map(story => (
                             <MenuItem key={story._id} value={story._id}>{story.title}</MenuItem>
                        ))}
                    </CustomTextField>
                    <CustomTextField
                        fullWidth
                        label='Episode Name'
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                     <CustomTextField
                        fullWidth
                        type='number'
                        label='Episode Number'
                        value={formData.episodeNumber}
                        onChange={(e) => setFormData({...formData, episodeNumber: e.target.value})}
                    />
                     <CustomTextField
                        fullWidth
                        type='number'
                        label='Coin'
                        value={formData.coin}
                        onChange={(e) => setFormData({...formData, coin: e.target.value})}
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-center'>
                     <CustomTextField
                        select
                        fullWidth
                        label='Type'
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                         <MenuItem value="episode">Episode</MenuItem>
                         <MenuItem value="trailer">Trailer</MenuItem>
                    </CustomTextField>
                    <FormControlLabel
                        control={
                            <Switch 
                                checked={formData.isFree} 
                                onChange={(e) => setFormData({...formData, isFree: e.target.checked})} 
                            />
                        }
                        label="Free Content"
                      />
                  </div>

                  <CustomTextField
                    fullWidth
                    multiline
                    rows={2}
                    label='Description'
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                  
                  <div className='flex flex-col gap-2 p-3 border rounded-lg bg-actionHover'>
                       <Typography variant='subtitle2' className='font-semibold'>Video Content</Typography>
                       <div className='flex gap-4 items-center'>
                            <Button component='label' variant='contained' size='small' color='secondary'>
                                Upload Video File
                                <input type='file' hidden accept='video/*' onChange={(e) => handleFileChange(e, 'video')} />
                            </Button>
                            <Typography variant='caption'>{formData.video ? formData.video.name : 'No file selected'}</Typography>
                       </div>
                       <Typography variant='caption' className='text-center my-1'>- OR -</Typography>
                       <CustomTextField
                            fullWidth
                            label='Video URL (External Link)'
                            placeholder='https://...'
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                        />
                  </div>
              </div>
          </DialogContent>
          <DialogActions className='px-8 pb-8'>
              <Button onClick={handleClose} color='secondary'>Cancel</Button>
              <Button onClick={handleSubmit} variant='contained' className='min-is-[100px]'>{editMode ? 'Update' : 'Create'}</Button>
          </DialogActions>
      </Dialog>

       {/* Video Player Dialog */}
       <Dialog open={videoDialogOpen} onClose={() => setVideoDialogOpen(false)} maxWidth='md' fullWidth>
          <DialogTitle className='flex justify-between items-center bg-black text-white'>
              <Typography variant='h6' color='inherit'>Video Preview</Typography>
              <IconButton onClick={() => setVideoDialogOpen(false)} color='inherit'><i className='tabler-x' /></IconButton>
          </DialogTitle>
          <DialogContent className='p-0 bg-black flex justify-center items-center overflow-hidden'>
              <div className='aspect-video w-full'>
                <ReactPlayer url={selectedVideoUrl} controls width='100%' height='100%' playing={videoDialogOpen} />
              </div>
          </DialogContent>
      </Dialog>
    </Card>
  )
}

export default GlobalEpisodeListTable
