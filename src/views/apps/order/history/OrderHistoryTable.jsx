'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'

// MUI
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'

// Table
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable
} from '@tanstack/react-table'

import { toast } from 'react-toastify'
import { getOrderHistory } from '@/services/ApiService'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const OrderHistoryTable = () => {
    // ================= STATES =================
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [type, setType] = useState('coin')

    // Dialog
    const [open, setOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [historyData, setHistoryData] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)

    const [summary, setSummary] = useState({
        totalHistory: 0,
        totalAdminEarnings: 0
    })

    // ================= FETCH MAIN TABLE =================
    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const { ok, result } = await getOrderHistory({ type })
            if (ok && result.success) {
                setData(result.data.history || [])
                setSummary({
                    totalHistory: result.data.totalHistory || 0,
                    totalAdminEarnings: result.data.totalAdminEarnings || 0
                })
            } else {
                toast.error(result?.message || 'Failed to fetch history')
            }
        } catch (e) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }, [type])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // ================= OPEN HISTORY (LAZY LOAD) =================
    const handleShowHistory = async (user) => {
        setOpen(true)
        setSelectedUser(user)
        setHistoryLoading(true)
        setHistoryData([])

        try {
            const { ok, result } = await getOrderHistory({
                type,
                userId: user._id
            })

            if (ok && result.success) {
                const userHistory = result.data.history?.[0]
                const purchases =
                    userHistory?.coinPlanPurchase ||
                    userHistory?.vipPlanPurchase ||
                    []

                setHistoryData(purchases)
            } else {
                toast.error('Failed to load history')
            }
        } catch (e) {
            toast.error('Failed to load history')
        } finally {
            setHistoryLoading(false)
        }
    }

    // ================= CLOSE DIALOG (CRITICAL FIX) =================
    const handleCloseDialog = () => {
        setOpen(false)

        // heavy cleanup AFTER dialog closes
        requestAnimationFrame(() => {
            setHistoryData([])
            setSelectedUser(null)
            setHistoryLoading(false)
        })
    }

    // ================= MAIN TABLE =================
    const columns = useMemo(
        () => [
            columnHelper.display({
                id: 'no',
                header: 'No',
                cell: ({ row }) => row.index + 1
            }),
            columnHelper.accessor('name', {
                header: 'Name',
                cell: ({ row }) => (
                    <div className='flex flex-col'>
                        <Typography fontWeight={500}>
                            {row.original.name || 'N/A'}
                        </Typography>
                        <Typography variant='caption'>
                            {row.original.username || ''}
                        </Typography>
                    </div>
                )
            }),
            columnHelper.accessor('totalPlansPurchased', {
                header: 'Total Purchases'
            }),
            columnHelper.accessor('totalAmountSpent', {
                header: 'Amount Spent',
                cell: info => (
                    <span className='text-success'>
                        {info.getValue()}
                    </span>
                )
            }),
            columnHelper.display({
                id: 'history',
                header: 'History',
                cell: ({ row }) => (
                    <IconButton
                        size='small'
                        onClick={() => handleShowHistory(row.original)}
                    >
                        <i className='tabler-history' />
                    </IconButton>
                )
            })
        ],
        [handleShowHistory]
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    })

    // ================= DETAIL TABLE (ONLY WHEN OPEN) =================
    const detailColumns = useMemo(
        () => [
            { id: 'no', header: 'No', cell: info => info.row.index + 1 },
            { accessorKey: 'uniqueId', header: 'Unique ID' },
            {
                accessorKey: 'price',
                header: 'Price  ',
                cell: info => (
                    <span className='text-success'>
                        {info.getValue() || 0}
                    </span>
                )
            },
            { accessorKey: 'coin', header: 'Coin' },
            {
                accessorKey: 'date',
                header: 'Date',
                cell: info =>
                    info.getValue()
                        ? new Date(info.getValue()).toLocaleDateString('en-GB')
                        : 'N/A'
            }
        ],
        []
    )

    const detailTable = useReactTable({
        data: historyData.slice(0, 200),
        columns: detailColumns,
        getCoreRowModel: getCoreRowModel()
    })

    // ================= UI =================
    return (
        <Box className='flex flex-col gap-4'>
            <Tabs
                value={type}
                onChange={(e, v) => setType(v)}
                sx={{
                    '& .MuiTabs-indicator': { display: 'none' },
                    '& .MuiTab-root': {
                        minHeight: 38,
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 500,
                        mr: 2,
                        px: 4,
                        '&.Mui-selected': {
                            backgroundColor: 'error.main',
                            color: 'white'
                        }
                    }
                }}
            >
                <Tab value='coin' label='Coin Plan' />
                <Tab value='vip' label='VIP Plan' />
            </Tabs>

            <Card>
                <CardHeader
                    title={`${type === 'coin' ? 'Coin' : 'VIP'} Plan History`}
                    action={
                        <Typography fontWeight={600} className='text-success'>
                            Admin Earnings : {summary.totalAdminEarnings}
                        </Typography>
                    }
                />

                <div className='overflow-x-auto'>
                    <table className={tableStyles.table}>
                        <thead>
                            {table.getHeaderGroups().map(hg => (
                                <tr key={hg.id}>
                                    {hg.headers.map(h => (
                                        <th key={h.id}>
                                            {flexRender(h.column.columnDef.header, h.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className='p-6 text-center'>
                                        <CircularProgress />
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className='p-6 text-center'>
                                        No records found
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ================= DETAIL DIALOG ================= */}
            <Dialog
                open={open}
                onClose={handleCloseDialog}
                maxWidth='lg'
                fullWidth
                keepMounted={false}
            >
                <DialogTitle>
                    {selectedUser?.name}&apos;s Purchase History
                </DialogTitle>

                <DialogContent>
                    {historyLoading ? (
                        <div className='flex justify-center p-10'>
                            <CircularProgress />
                        </div>
                    ) : (
                        open &&
                        detailTable && (
                            <div className='overflow-x-auto'>
                                <table className={tableStyles.table}>
                                    <thead>
                                        {detailTable.getHeaderGroups().map(hg => (
                                            <tr key={hg.id}>
                                                {hg.headers.map(h => (
                                                    <th key={h.id}>
                                                        {flexRender(
                                                            h.column.columnDef.header,
                                                            h.getContext()
                                                        )}
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody>
                                        {detailTable.getRowModel().rows.map(row => (
                                            <tr key={row.id}>
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default OrderHistoryTable
