'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Component Imports
import CardStatVertical from '@/components/card-statistics/Vertical'

// Service Imports
import { getDashboardStatistics } from '@/services/ApiService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Util Imports
import { getInitials } from '@/utils/getInitials'

const DashboardData = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { ok, result } = await getDashboardStatistics()
                if (ok && (result.status || result.success)) {
                    setData(result.data)
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <Box className='flex justify-center items-center h-[50vh]'>
                <CircularProgress />
            </Box>
        )
    }

    if (!data) {
        return (
            <Box className='flex justify-center items-center h-[50vh]'>
                <Typography>No data available</Typography>
            </Box>
        )
    }

    const { counts, recentUsers, recentTransactions } = data

    return (
        <Grid container spacing={6}>
            {/* Stats Cards */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                <CardStatVertical
                    title='Total Users'
                    stats={counts.totalUsers.toString()}
                    avatarColor='primary'
                    avatarIcon='tabler-users'
                    avatarSkin='light'
                    avatarSize={44}
                    chipText='Total'
                    chipColor='primary'
                    chipVariant='tonal'
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                <CardStatVertical
                    title='Active VIP Users'
                    stats={counts.activeVipUsers.toString()}
                    avatarColor='warning'
                    avatarIcon='tabler-crown'
                    avatarSkin='light'
                    avatarSize={44}
                    chipText='Active'
                    chipColor='warning'
                    chipVariant='tonal'
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                <CardStatVertical
                    title='Total Stories'
                    stats={counts.totalStories.toString()}
                    avatarColor='success'
                    avatarIcon='tabler-book'
                    avatarSkin='light'
                    avatarSize={44}
                    chipText='Stories'
                    chipColor='success'
                    chipVariant='tonal'
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                <CardStatVertical
                    title='Total Episodes'
                    stats={counts.totalEpisodes.toString()}
                    avatarColor='info'
                    avatarIcon='tabler-video'
                    avatarSkin='light'
                    avatarSize={44}
                    chipText='Episodes'
                    chipColor='info'
                    chipVariant='tonal'
                />
            </Grid>
            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                <CardStatVertical
                    title='Total Coins'
                    stats={counts.totalCoinsCredit.toString()}
                    avatarColor='warning'
                    avatarIcon='tabler-coin'
                    avatarSkin='light'
                    avatarSize={44}
                    chipText='Credit'
                    chipColor='warning'
                    chipVariant='tonal'
                />
            </Grid> */}

            {/* Recent Users Table */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card className='h-full'>
                    <CardHeader title='Recent Users' />
                    <div className='overflow-x-auto'>
                        <table className={tableStyles.table}>
                            <thead className='uppercase'>
                                <tr className='border-be'>
                                    <th className='leading-6 plb-4 pis-6 pli-2'>User</th>
                                    <th className='leading-6 plb-4 pli-2'>Status</th>
                                    <th className='leading-6 plb-4 pie-6 pli-2 text-right'>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.length > 0 ? (
                                    recentUsers.map((user, index) => (
                                        <tr key={index} className='border-0'>
                                            <td className='pis-6 pli-2 plb-3'>
                                                <div className='flex items-center gap-4'>
                                                    <Avatar src={user.image} alt={user.name}>
                                                        {getInitials(user.name)}
                                                    </Avatar>
                                                    <div className='flex flex-col'>
                                                        <Typography color='text.primary' className='font-medium'>
                                                            {user.name}
                                                        </Typography>
                                                        <Typography variant='body2' color='text.disabled'>
                                                            {user.email || user.mobileNumber || 'N/A'}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='pli-2 plb-3'>
                                                <Chip
                                                    label={user.isVip ? 'VIP' : 'Regular'}
                                                    color={user.isVip ? 'warning' : 'secondary'}
                                                    size='small'
                                                    variant='tonal'
                                                />
                                            </td>
                                            <td className='pli-2 plb-3 pie-6 text-right'>
                                                <Typography variant='body2' color='text.primary'>
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className='text-center p-4'>
                                            No recent users
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </Grid>

            {/* Recent Transactions Table */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card className='h-full'>
                    <CardHeader title='Recent Transactions' />
                    <div className='overflow-x-auto'>
                        <table className={tableStyles.table}>
                            <thead className='uppercase'>
                                <tr className='border-be'>
                                    <th className='leading-6 plb-4 pis-6 pli-2'>Description</th>
                                    <th className='leading-6 plb-4 pli-2'>Amount</th>
                                    <th className='leading-6 plb-4 pie-6 pli-2 text-right'>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((transaction, index) => (
                                        <tr key={index} className='border-0'>
                                            <td className='pis-6 pli-2 plb-3'>
                                                <div className='flex flex-col'>
                                                    <Typography color='text.primary' className='font-medium'>
                                                        {transaction.description}
                                                    </Typography>
                                                    <Typography variant='caption' color='text.disabled'>
                                                        {transaction.user?.name}
                                                    </Typography>
                                                </div>
                                            </td>
                                            <td className='pli-2 plb-3'>
                                                <Typography
                                                    color={transaction.type === 'credit' ? 'success.main' : 'error.main'}
                                                    className='font-medium'
                                                >
                                                    {transaction.type === 'credit' ? '+' : '-'}
                                                    {transaction.coins}
                                                </Typography>
                                            </td>
                                            <td className='pli-2 plb-3 pie-6 text-right'>
                                                <Typography variant='body2' color='text.primary'>
                                                    {new Date(transaction.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className='text-center p-4'>
                                            No recent transactions
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </Grid>
        </Grid>
    )
}

export default DashboardData
