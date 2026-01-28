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

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const AdRewardDialog = ({ open, setOpen, reward, handleSave }) => {
  const [formData, setFormData] = useState({
    adLabel: '',
    adDisplayInterval: '',
    coinEarnedFromAd: ''
  })

  useEffect(() => {
    if (reward && open) {
      setFormData({
        adLabel: reward.adLabel || '',
        adDisplayInterval: reward.adDisplayInterval || '',
        coinEarnedFromAd: reward.coinEarnedFromAd || ''
      })
    } else {
      setFormData({
        adLabel: '',
        adDisplayInterval: '',
        coinEarnedFromAd: ''
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
      ...formData,
      adDisplayInterval: Number(formData.adDisplayInterval),
      coinEarnedFromAd: Number(formData.coinEarnedFromAd)
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
        <Typography variant='h5'>{reward ? 'Edit Ad Reward' : 'Add Ad Reward'}</Typography>
        <IconButton onClick={handleClose} size='small'>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>
      <DialogContent className='pli-4 pbs-4 pbe-4'>
        <Box className="flex flex-col gap-4 p-4">
          <CustomTextField
            fullWidth
            autoComplete='off'
            label="AD Label"
            name="adLabel"
            placeholder="e.g. AD1"
            value={formData.adLabel}
            onChange={onChange}
            disabled={!!reward}
          />
          <CustomTextField
            fullWidth
            autoComplete='off'
            label="Display Interval (Seconds)"
            name="adDisplayInterval"
            placeholder="300"
            value={formData.adDisplayInterval}
            onChange={onChange}
          />
          <CustomTextField
            fullWidth
            autoComplete='off'
            label="Coins Earned"
            name="coinEarnedFromAd"
            placeholder="50"
            value={formData.coinEarnedFromAd}
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

export default AdRewardDialog
