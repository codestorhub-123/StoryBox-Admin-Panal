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

// Service Imports
import { getCoinHistory } from '@/services/ApiService'

const OverViewTab = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return
            try {
                const { ok, result } = await getCoinHistory({ id, limit: 100 })
                if (ok && result.success) {
                    setData(result.data.docs || []) // Assuming pagination structure
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
            <CardHeader title='Coin History' />
            <div className='overflow-x-auto'>
                {loading ? (
                    <div className='text-center p-10'>
                        <CircularProgress />
                    </div>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.length > 0 ? (
                                data.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{row.coins}</TableCell>
                                        <TableCell className='capitalize'>{row.type}</TableCell>
                                        <TableCell>{row.description}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align='center'>
                                        <Typography>No history found</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </Card>
      </Grid>
    </Grid>
  )
}

export default OverViewTab
