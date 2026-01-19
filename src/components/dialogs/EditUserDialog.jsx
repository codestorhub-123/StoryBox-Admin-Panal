'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

const EditUserDialog = ({ open, setOpen, user, handleUpdateName }) => {
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (user && open) {
      setNewName(user.name)
    }
  }, [user, open])

  const handleClose = () => {
    setOpen(false)
    setNewName('')
  }

  const onConfirm = () => {
      handleUpdateName(user._id, newName)
  }

  return (
    <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth='sm'
        fullWidth
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle className='flex justify-between items-center plb-4 pli-6 border-be'>
          <Typography variant='h5'>Edit User Details</Typography>
          <IconButton onClick={handleClose} size='small'>
             <i className='tabler-x' />
          </IconButton>
        </DialogTitle>
        <DialogContent className='pli-4 pbs-4 pbe-4'>
            <div className="flex flex-col gap-6 p-4">
                {user && (
                    <div className="flex items-center gap-4 p-4 rounded border">
                         <CustomAvatar src={user.image} size={50} skin='light' color='primary' variant='rounded'>
                            {getInitials(user.name)}
                         </CustomAvatar>
                         <div className='flex flex-col'>
                            <Typography variant="h6">{user.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                            <Typography variant="caption" color="text.disabled">ID: {user.uniqueId}</Typography>
                         </div>
                    </div>
                )}
                <CustomTextField
                    autoFocus
                    fullWidth
                    label="Full Name"
                    placeholder="Enter new name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    helperText="This name will be visible to all users."
                />
            </div>
        </DialogContent>
        <DialogActions className='pbe-4 pli-6 justify-end'>
            <Button onClick={handleClose} color="secondary" variant="tonal">Cancel</Button>
            <Button onClick={onConfirm} variant="contained" endIcon={<i className='tabler-check' />}>Update Changes</Button>
        </DialogActions>
      </Dialog>
  )
}

export default EditUserDialog
