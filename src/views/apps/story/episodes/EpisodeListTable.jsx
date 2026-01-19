'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'

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
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'

// Third-party Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { toast } from 'react-toastify'
import classnames from 'classnames'
import ReactPlayer from 'react-player'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Service Imports
import { getEpisodes, createEpisode, updateEpisode, deleteEpisode, getStoryDetail } from '@/services/ApiService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const EpisodeListTable = () => {
  // Hooks
  const { id: storyId } = useParams()

  // States
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [story, setStory] = useState(null)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [rowCount, setRowCount] = useState(0)
  
  // Dialog States
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentEpisode, setCurrentEpisode] = useState(null)
  
  // Video Dialog States
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('')

  // Form States
  const [formData, setFormData] = useState({
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

  const resetForm = () => {
      setFormData({
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

  const fetchStory = async () => {
      try {
          const { ok, result } = await getStoryDetail(storyId)
          if(ok && result.success) {
              setStory(result.data)
          }
      } catch (err) {
          console.error('Err fetching story detail')
      }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const { ok, result } = await getEpisodes({
        storyId,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      })

      if (ok && result.success) {
        setData(result.data.docs)
        setRowCount(result.data.totalDocs)
        
        // Calculate next episode number
        const maxEp = result.data.docs.reduce((max, ep) => {
            const num = Number(ep.episodeNumber) || 0
            return num > max ? num : max
        }, 0)
        
        setFormData(prev => ({
            ...prev, 
            episodeNumber: maxEp + 1
        }))
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
    fetchStory()
  }, [storyId])

  useEffect(() => {
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize, storyId])

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

  const handleEdit = (episode) => {
      setEditMode(true)
      setCurrentEpisode(episode)
      setFormData({
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

  const handlePlayVideo = (videoUrl) => {
    setSelectedVideoUrl(getImageUrl(videoUrl))
    setVideoDialogOpen(true)
  }

  const handleSubmit = async () => {
      if(!formData.name.trim()) return toast.error('Name is required')
      
      let finalThumbnail = formData.thumbnail

      // Auto-capture thumbnail if missing but video exists
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
      
      submitData.append('storyId', storyId)
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
            
            // Auto-capture preview if no thumbnail and it's a video file
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
        cell: ({ row }) => (
            <Typography variant='body2'>
                {(pagination.pageIndex * pagination.pageSize) + row.index + 1}
            </Typography>
        )
      }),
      columnHelper.accessor('thumbnail', {
        header: 'Thumbnail',
        cell: ({ row }) => (
             <CustomAvatar src={getImageUrl(row.original.thumbnail)} size={50} variant='rounded' />
        )
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
            <div className='flex flex-col'>
                <Typography color='text.primary' className='font-medium'>
                    {row.original.name || 'No Name'}
                </Typography>
                <Typography variant='caption'>{row.original.type?.toUpperCase()}</Typography>
            </div>
        )
      }),
       columnHelper.accessor('episodeNumber', {
        header: 'Ep. No',
        cell: ({ row }) => (
            <Typography variant='body2'>
                {row.original.type === 'trailer' ? 'Trailer' : row.original.episodeNumber}
            </Typography>
        )
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
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: ({ row }) => (
            <Typography variant='body2'>
                {new Date(row.original.createdAt).toLocaleDateString('en-GB')}
            </Typography>
        )
      }),
      columnHelper.display({
        id: 'preview',
        header: 'Preview',
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
        title={story ? `Episodes: ${story.title}` : 'Episodes'} 
        subheader={story ? `Manage episodes for ${story.title}` : ''}
        action={
            <Button variant='contained' onClick={handleOpen} startIcon={<i className='tabler-plus' />}>
                Add Episode
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
          <DialogTitle>{editMode ? 'Edit Episode' : 'Add Episode'}</DialogTitle>
          <DialogContent>
              <div className='flex flex-col gap-4 p-4'>
                  <div className='flex gap-4 justify-center'>
                      <div className='flex flex-col items-center gap-2'>
                        <Typography variant='caption'>Thumbnail</Typography>
                        <CustomAvatar src={formData.thumbnailPreview} size={100} variant='rounded' />
                        <Button component='label' variant='outlined' size='small'>
                            Upload
                            <input type='file' hidden accept='image/*' onChange={(e) => handleFileChange(e, 'thumbnail')} />
                        </Button>
                      </div>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                     <div className='flex items-center gap-4'>
                       <FormControl component="fieldset">
                        <FormLabel component="legend">Type</FormLabel>
                        <RadioGroup 
                            row 
                            value={formData.type} 
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
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
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                  
                  <div className='flex flex-col gap-2'>
                       <Typography variant='subtitle2'>Video Content</Typography>
                       <div className='flex gap-4 items-center'>
                            <Button component='label' variant='contained' size='small' color='info'>
                                Upload Video File
                                <input type='file' hidden accept='video/*' onChange={(e) => handleFileChange(e, 'video')} />
                            </Button>
                            <Typography variant='caption'>{formData.video ? formData.video.name : 'No file selected'}</Typography>
                       </div>
                       <Typography variant='caption' className='text-center'>- OR -</Typography>
                       <CustomTextField
                            fullWidth
                            label='Video URL (External Link)'
                            placeholder='https://...'
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                        />
                  </div>

                  <div className='flex gap-4'>
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
              </div>
          </DialogContent>
          <DialogActions>
              <Button onClick={handleClose} color='secondary'>Cancel</Button>
              <Button onClick={handleSubmit} variant='contained'>{editMode ? 'Update' : 'Create'}</Button>
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
              <Typography variant='h6'>Preview</Typography>
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
    </Card>
  )
}

export default EpisodeListTable
