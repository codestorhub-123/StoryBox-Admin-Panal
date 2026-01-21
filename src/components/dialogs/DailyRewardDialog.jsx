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
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const DailyRewardDialog = ({ open, setOpen, reward, handleSave }) => {
  const [formData, setFormData] = useState({
    day: '',
    dailyRewardCoin: ''
  })

  useEffect(() => {
    if (reward && open) {
      setFormData({
        day: reward.day || '',
        dailyRewardCoin: reward.dailyRewardCoin || ''
      })
    } else {
      setFormData({
        day: '',
        dailyRewardCoin: ''
      })
    }
  }, [reward, open])

  const handleClose = () => {
    setOpen(false)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const onConfirm = () => {
      const dataToSave = {
          day: Number(formData.day),
          dailyRewardCoin: Number(formData.dailyRewardCoin)
      }
      handleSave(reward?._id, dataToSave)
  }

  return (
    <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth='xs'
        fullWidth
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle className='flex justify-between items-center plb-4 pli-6 border-be'>
          <Typography variant='h5'>{reward ? 'Edit Daily Reward' : 'Add Daily Reward'}</Typography>
          <IconButton onClick={handleClose} size='small'>
             <i className='tabler-x' />
          </IconButton>
        </DialogTitle>
        <DialogContent className='pli-4 pbs-4 pbe-4'>
            <Box className="flex flex-col gap-4 p-4">
                <CustomTextField
                    select
                    fullWidth
                    label="Day"
                    name="day"
                    value={formData.day}
                    onChange={onChange}
                    disabled={!!reward}
                >
                    {[1, 2, 3, 4, 5, 6, 7].map(d => (
                        <MenuItem key={d} value={d}>Day {d}</MenuItem>
                    ))}
                </CustomTextField>
                <CustomTextField
                    fullWidth
                    autoComplete='off'
                    label="Coins Reward"
                    name="dailyRewardCoin"
                    type="number"
                    placeholder="10"
                    value={formData.dailyRewardCoin}
                    onChange={onChange}
                />
            </Box>
        </DialogContent>
        <DialogActions className='pbe-4 pli-6 justify-end'>
            <Button onClick={handleClose} color="secondary" variant="tonal">Cancel</Button>
            <Button onClick={onConfirm} variant="contained" endIcon={<i className='tabler-check' />}>
                {reward ? 'Update' : 'Create'}
            </Button>
        </DialogActions>
      </Dialog>
  )
}

export default DailyRewardDialog
