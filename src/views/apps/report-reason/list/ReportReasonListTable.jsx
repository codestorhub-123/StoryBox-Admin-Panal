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
import ReportReasonDialog from '@/components/dialogs/ReportReasonDialog'

// Service Imports
import { getReportReasons, createReportReason, updateReportReason, deleteReportReason } from '@/services/ApiService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const ReportReasonListTable = () => {
    // States
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })
    const [rowCount, setRowCount] = useState(0)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingReason, setEditingReason] = useState(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const { ok, result } = await getReportReasons({
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize
            })

            // Check for either status or success
            if (ok && (result.status || result.success)) {
                // Handle both paginated (docs) and non-paginated (array) responses
                const docs = result.data?.docs || (Array.isArray(result.data) ? result.data : [])
                const total = result.data?.totalDocs || result.data?.length || 0

                setData(docs)
                setRowCount(total)
            } else {
                toast.error(result.message || 'Failed to fetch report reasons')
            }
        } catch (error) {
            toast.error('Error fetching report reasons')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [pagination.pageIndex, pagination.pageSize])

    const handleAddClick = () => {
        setEditingReason(null)
        setDialogOpen(true)
    }

    const handleEditClick = (reason) => {
        setEditingReason(reason)
        setDialogOpen(true)
    }

    const handleSave = async (id, formData) => {
        try {
            let res;
            if (id) {
                res = await updateReportReason(id, formData)
            } else {
                res = await createReportReason(formData)
            }

            if (res.ok && (res.result.success || res.result.status)) {
                toast.success(id ? 'Report reason updated successfully' : 'Report reason created successfully')
                setDialogOpen(false)
                fetchData()
            } else {
                toast.error(res.result.message || 'Failed to save report reason')
            }
        } catch (error) {
            toast.error('Error saving report reason')
        }
    }

    const handleDelete = (id) => {
        toast(
            ({ closeToast }) => (
                <div className='flex flex-col gap-4'>
                    <Typography variant='body1' className='font-medium'>
                        Are you sure you want to delete this report reason?
                    </Typography>
                    <div className='flex gap-2 justify-end'>
                        <Button
                            variant='contained'
                            color='error'
                            size='small'
                            onClick={async () => {
                                closeToast()
                                try {
                                    const { ok, result } = await deleteReportReason(id)
                                    if (ok && (result.success || result.status)) {
                                        toast.success('Report reason deleted successfully')
                                        fetchData()
                                    } else {
                                        toast.error(result.message || 'Failed to delete report reason')
                                    }
                                } catch (error) {
                                    toast.error('Error deleting report reason')
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
            columnHelper.accessor('title', {
                header: 'Title',
                cell: ({ row }) => (
                    <Typography color='text.primary' className='font-medium'>
                        {row.original.title}
                    </Typography>
                )
            }),
            columnHelper.accessor('createdAt', {
                header: 'Created At',
                cell: ({ row }) => (
                    <Typography>
                        {new Date(row.original.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </Typography>
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
                title='Report Reasons'
                action={
                    <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={handleAddClick}>
                        Add Reason
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
            <ReportReasonDialog
                open={dialogOpen}
                setOpen={setDialogOpen}
                reason={editingReason}
                handleSave={handleSave}
            />
        </Card>
    )
}

export default ReportReasonListTable
