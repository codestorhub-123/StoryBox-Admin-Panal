'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

const UserDetailsDialog = ({ open, setOpen, user }) => {

  const handleClose = () => {
    setOpen(false)
  }

  if (!user) return null

  return (
    <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth='sm'
        fullWidth
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle className='flex justify-between items-center plb-4 pli-6 border-be'>
          <Typography variant='h5'>User Details</Typography>
          <IconButton onClick={handleClose} size='small'>
             <i className='tabler-x' />
          </IconButton>
        </DialogTitle>
        <DialogContent className='pli-4 pbs-4 pbe-4'>
            <div className="flex flex-col gap-6 p-4">
               <div className="flex flex-col items-center gap-2">
                    <CustomAvatar src={user.image} size={80} skin='light' color='primary' variant='rounded' className='mbe-2'>
                        {getInitials(user.name)}
                    </CustomAvatar>
                    <Typography variant="h5">{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{user.email}</Typography>
               </div>

               <Divider />

               <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                     <Typography className="font-medium">Login Type:</Typography>
                     <Chip label={user.loginType || 'Email'} size="small" color="primary" variant="tonal" className="capitalize"/>
                  </div>
                  <div className="flex justify-between items-center">
                     <Typography className="font-medium">Unique ID:</Typography>
                     <Typography color="text.secondary">{user.uniqueId}</Typography>
                  </div>
                   <div className="flex justify-between items-center">
                     <Typography className="font-medium">Coins:</Typography>
                     <div className="flex items-center gap-1">
                        <i className="tabler-coin text-warning" />
                        <Typography className="font-bold">{user.coins || 0}</Typography>
                     </div>
                  </div>
                  <div className="flex justify-between items-center">
                     <Typography className="font-medium">Mobile:</Typography>
                     <Typography color="text.secondary">{user.mobileNumber ? `${user.mobilePrefix} ${user.mobileNumber}` : '-'}</Typography>
                  </div>
               </div>
            </div>
        </DialogContent>
      </Dialog>
  )
}

export default UserDetailsDialog
