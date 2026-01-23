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
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'

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

// Service Imports
import { getReports, deleteReport } from '@/services/ApiService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const ReportListTable = () => {
    // States
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })
    const [rowCount, setRowCount] = useState(0)

    const fetchData = async () => {
        setLoading(true)
        try {
            const { ok, result } = await getReports({
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize
            })

            if (ok && (result.status || result.success)) {
                // Handle both paginated (docs) and non-paginated (array) responses
                const docs = result.data?.docs || (Array.isArray(result.data) ? result.data : [])
                const total = result.data?.totalDocs || result.data?.length || 0

                setData(docs)
                setRowCount(total)
            } else {
                toast.error(result.message || 'Failed to fetch reports')
            }
        } catch (error) {
            toast.error('Error fetching reports')
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
                        Are you sure you want to delete this report?
                    </Typography>
                    <div className='flex gap-2 justify-end'>
                        <Button
                            variant='contained'
                            color='error'
                            size='small'
                            onClick={async () => {
                                closeToast()
                                try {
                                    const { ok, result } = await deleteReport(id)
                                    if (ok && (result.success || result.status)) {
                                        toast.success('Report deleted successfully')
                                        fetchData()
                                    } else {
                                        toast.error(result.message || 'Failed to delete report')
                                    }
                                } catch (error) {
                                    toast.error('Error deleting report')
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
            columnHelper.accessor('user', {
                header: 'User',
                cell: ({ row }) => {
                    const user = row.original.user
                    return (
                        <div className='flex items-center gap-3'>
                            <Avatar
                                src={user?.image ? `${process.env.NEXT_PUBLIC_URL}/${user.image}` : undefined}
                                alt={user?.name || 'User'}
                                sx={{ width: 34, height: 34 }}
                            >
                                {!user?.image && (user?.name?.[0]?.toUpperCase() || 'U')}
                            </Avatar>
                            <div className='flex flex-col'>
                                <Typography color='text.primary' className='font-medium'>
                                    {user?.name || 'N/A'}
                                </Typography>
                                <Typography variant='body2' color='text.secondary'>
                                    {user?.email || ''}
                                </Typography>
                            </div>
                        </div>
                    )
                }
            }),
            columnHelper.accessor('story', {
                header: 'Story',
                cell: ({ row }) => (
                    <Typography color='text.primary'>
                        {row.original.story?.title || 'N/A'}
                    </Typography>
                )
            }),
            columnHelper.accessor('episode', {
                header: 'Episode',
                cell: ({ row }) => {
                    const episode = row.original.episode
                    return (
                        <Typography color='text.primary'>
                            {episode ? `${episode.name} (${episode.episodeNumber})` : 'N/A'}
                        </Typography>
                    )
                }
            }),
            columnHelper.accessor('reason', {
                header: 'Reason',
                cell: ({ row }) => (
                    <Chip
                        label={row.original.reason?.title || 'N/A'}
                        color='error'
                        variant='tonal'
                        size='small'
                    />
                )
            }),
            columnHelper.accessor('description', {
                header: 'Description',
                cell: ({ row }) => (
                    <Typography
                        color='text.secondary'
                        className='max-w-xs truncate'
                        title={row.original.description}
                    >
                        {row.original.description || 'No description'}
                    </Typography>
                )
            }),
            columnHelper.accessor('createdAt', {
                header: 'Reported At',
                cell: ({ row }) => (
                    <Typography>
                        {new Date(row.original.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Typography>
                )
            }),
            columnHelper.accessor('action', {
                header: 'Action',
                cell: ({ row }) => (
                    <div className='flex items-center gap-1'>
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
        rowCount, // ✅ Added rowCount here
        state: {
            pagination,
        },
        manualPagination: true,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <Card>
            <CardHeader
                title='User Reports'
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
                                    No reports available
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
        </Card>
    )
}

export default ReportListTable
