'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Service Imports
import { getAdminProfile } from '@/services/ApiService'

const UserProfileHeader = () => {
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
    <Card>
      <CardMedia image='/images/pages/profile-banner.png' className='bs-[250px]' />
      <CardContent className='flex gap-5 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0  border-backgroundPaper bg-backgroundPaper'>
          <img height={120} width={120} src='/images/avatars/1.png' className='rounded' alt='Profile Background' />
        </div>
        <div className='flex is-full justify-start self-end flex-col items-center gap-6 sm-gap-0 sm:flex-row sm:justify-between sm:items-end '>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <Typography variant='h4'>{data?.username || 'Admin'}</Typography>
            <div className='flex flex-wrap gap-6 justify-center sm:justify-normal'>
              <div className='flex items-center gap-2'>
                <i className='tabler-mail' />
                <Typography className='font-medium'>{data?.email || 'admin@sojo.com'}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-calendar' />
                <Typography className='font-medium'>Joined {new Date(data?.createdAt || Date.now()).toLocaleDateString()}</Typography>
              </div>
            </div>
          </div>
          <Button variant='contained' className='flex gap-2' disabled>
            <i className='tabler-user-check !text-base'></i>
            <span>Active</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfileHeader
