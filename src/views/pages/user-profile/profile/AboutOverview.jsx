'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// Service Imports
import { getAdminProfile } from '@/services/ApiService'

const AboutOverview = () => {
    const [data, setData] = useState(null)

    useEffect(() => {
        const fetchProfile = async () => {
             try {
                 const { ok, result } = await getAdminProfile()
                 if(ok && result.success) {
                     setData(result.data)
                 }
             } catch (error) {
                 console.error('Failed to fetch admin profile')
             }
        }
        fetchProfile()
    }, [])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col gap-6'>
            <div className='flex flex-col gap-4'>
              <Typography className='uppercase' variant='body2' color='text.disabled'>
                About
              </Typography>
              {data ? (
                  <div className='flex flex-col gap-4'>
                    <div className='flex items-center gap-2'>
                        <i className='tabler-user' />
                        <div className='flex items-center flex-wrap gap-2'>
                            <Typography className='font-medium'>Full Name:</Typography>
                            <Typography>{data.username}</Typography>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <i className='tabler-mail' />
                        <div className='flex items-center flex-wrap gap-2'>
                            <Typography className='font-medium'>Email:</Typography>
                            <Typography>{data.email}</Typography>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <i className='tabler-crown' />
                        <div className='flex items-center flex-wrap gap-2'>
                            <Typography className='font-medium'>Role:</Typography>
                            <Typography className='capitalize'>{data.role || 'Admin'}</Typography>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <i className='tabler-check' />
                        <div className='flex items-center flex-wrap gap-2'>
                            <Typography className='font-medium'>Status:</Typography>
                            <Typography>Active</Typography>
                        </div>
                    </div>
                     <div className='flex items-center gap-2'>
                        <i className='tabler-calendar' />
                        <div className='flex items-center flex-wrap gap-2'>
                            <Typography className='font-medium'>Joined Date:</Typography>
                            <Typography>{new Date(data.createdAt).toLocaleDateString()}</Typography>
                        </div>
                    </div>
                  </div>
              ) : (
                  <Typography>Loading...</Typography>
              )}
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AboutOverview
