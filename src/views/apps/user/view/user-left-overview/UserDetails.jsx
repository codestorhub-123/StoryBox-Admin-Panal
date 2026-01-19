'use client'

// React Imports
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Service Imports
import { getUserDetail } from '@/services/ApiService'

const UserDetails = () => {
  // Hooks
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  // States
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
        if(!id) return
        setLoading(true)
        try {
            const { ok, result } = await getUserDetail(id)
            if(ok && result.success) {
                setUserData(result.data)
            }
        } catch (error) {
            console.error('Failed to fetch user details', error)
        } finally {
            setLoading(false)
        }
    }

    fetchUser()
  }, [id])

  if(loading) {
      return (
          <Card>
              <CardContent className='flex justify-center items-center min-h-[400px]'>
                  <CircularProgress />
              </CardContent>
          </Card>
      )
  }

  if(!userData) {
      return (
        <Card>
            <CardContent className='flex justify-center items-center min-h-[200px]'>
                <Typography>User not found</Typography>
            </CardContent>
        </Card>
      )
  }

  return (
    <>
      <Card>
        <CardContent className='flex flex-col pbs-12 gap-6'>
          <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-center flex-col gap-4'>
              <div className='flex flex-col items-center gap-4'>
                <CustomAvatar 
                    alt={userData.name} 
                    src={userData.image} 
                    variant='rounded' 
                    size={120} 
                />
                <Typography variant='h5'>{userData.name}</Typography>
              </div>
              <Chip 
                label={userData.isBlocked ? 'Blocked' : 'Active'} 
                color={userData.isBlocked ? 'error' : 'success'} 
                size='small' 
                variant='tonal' 
              />
            </div>
            <div className='flex items-center justify-around flex-wrap gap-4'>
              <div className='flex items-center gap-4'>
                <CustomAvatar variant='rounded' color='primary' skin='light'>
                  <i className='tabler-coin' />
                </CustomAvatar>
                <div>
                  <Typography variant='h5'>{userData.coins || 0}</Typography>
                  <Typography>Coins</Typography>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Typography variant='h5'>Details</Typography>
            <Divider className='mlb-4' />
            <div className='flex flex-col gap-2'>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  Unique ID:
                </Typography>
                <Typography>{userData.uniqueId}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  Email:
                </Typography>
                <Typography>{userData.email || '-'}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  Mobile:
                </Typography>
                <Typography color='text.primary'>
                    {userData.mobileNumber ? `${userData.mobilePrefix || ''} ${userData.mobileNumber}` : '-'}
                </Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  Gender:
                </Typography>
                <Typography color='text.primary' className='capitalize'>{userData.gender || '-'}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  Login Type:
                </Typography>
                <Typography color='text.primary' className='capitalize'>{userData.loginType || '-'}</Typography>
              </div>
               <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  Last Active:
                </Typography>
                <Typography color='text.primary'>{new Date(userData.updatedAt).toLocaleDateString()}</Typography>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default UserDetails
