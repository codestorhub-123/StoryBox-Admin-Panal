'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'

// Service Imports
import { getUserCoinPlanHistory } from '@/services/ApiService'

const CoinPlanHistory = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return
            setLoading(true)
            try {
                const { ok, result } = await getUserCoinPlanHistory({ 
                    id, 
                    page: page + 1, 
                    limit: rowsPerPage 
                })
                if (ok && result.success) {
                    setData(result.data.docs || [])
                    setTotal(result.data.totalDocs || 0)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id, page, rowsPerPage])

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
            <CardHeader title='Coin Plan History' />
            <div className='overflow-x-auto'>
                {loading ? (
                    <div className='text-center p-10'>
                        <CircularProgress />
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Plan Name</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Coins</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.length > 0 ? (
                                    data.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{row.planName || row.planId?.name || '-'}</TableCell>
                                            <TableCell>{row.price || row.planId?.price || '0'}</TableCell>
                                            <TableCell>{row.coins || row.planId?.coins || '0'}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.status || 'Success'} 
                                                    color={row.status === 'failed' ? 'error' : 'success'} 
                                                    size='small' 
                                                    variant='tonal'
                                                    className='capitalize'
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align='center'>
                                            <Typography>No history found</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component='div'
                            count={total}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </>
                )}
            </div>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CoinPlanHistory
