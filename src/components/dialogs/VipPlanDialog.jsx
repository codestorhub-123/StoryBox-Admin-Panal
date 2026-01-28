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
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const VipPlanDialog = ({ open, setOpen, plan, handleSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    validity: '',
    validityType: 'month',
    price: '',
    offerPrice: '',
    coins: '',
    tags: '',
    isActive: true
  })

  useEffect(() => {
    if (plan && open) {
      setFormData({
        name: plan.name || '',
        validity: plan.validity || '',
        validityType: plan.validityType || 'month',
        price: plan.price || '',
        offerPrice: plan.offerPrice || '',
        coins: plan.coins || '',
        tags: plan.tags || '',
        isActive: plan.isActive ?? true
      })
    } else {
      setFormData({
        name: '',
        validity: '',
        validityType: 'month',
        price: '',
        offerPrice: '',
        coins: '',
        tags: '',
        isActive: true
      })
    }
  }, [plan, open])

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
      validity: Number(formData.validity),
      price: Number(formData.price),
      offerPrice: Number(formData.offerPrice),
      coins: Number(formData.coins)
    }
    handleSave(plan?._id, dataToSave)
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
        <Typography variant='h5'>{plan ? 'Edit VIP Plan' : 'Add New VIP Plan'}</Typography>
        <IconButton onClick={handleClose} size='small'>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>
      <DialogContent className='pli-4 pbs-4 pbe-4'>
        <Box className="flex flex-col gap-4 p-4">
          <CustomTextField
            fullWidth
            autoComplete='off'
            label="Plan Name"
            name="name"
            placeholder="e.g. Gold Monthly"
            value={formData.name}
            onChange={onChange}
          />
          <Box className="flex gap-4">
            <CustomTextField
              fullWidth
              autoComplete='off'
              label="Validity"
              name="validity"
              placeholder="1"
              value={formData.validity}
              onChange={onChange}
            />
            <CustomTextField
              select
              fullWidth
              label="Validity Type"
              name="validityType"
              value={formData.validityType}
              onChange={onChange}
            >
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </CustomTextField>
          </Box>
          <Box className="flex gap-4">
            <CustomTextField
              fullWidth
              autoComplete='off'
              label="Original Price"
              name="price"
              placeholder="200"
              value={formData.price}
              onChange={onChange}
            />
            <CustomTextField
              fullWidth
              autoComplete='off'
              label="Offer Price"
              name="offerPrice"
              placeholder="99"
              value={formData.offerPrice}
              onChange={onChange}
            />
          </Box>
          <Box className="flex gap-4">
            <CustomTextField
              fullWidth
              autoComplete='off'
              label="Coins"
              name="coins"
              placeholder="500"
              value={formData.coins}
              onChange={onChange}
            />
            <CustomTextField
              fullWidth
              autoComplete='off'
              label="Tags"
              name="tags"
              placeholder="e.g. Best Selling Plan"
              value={formData.tags}
              onChange={onChange}
            />
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
            }
            label="Active Status"
          />
        </Box>
      </DialogContent>
      <DialogActions className='pbe-4 pli-6 justify-end'>
        <Button onClick={handleClose} color="secondary" variant="tonal">Cancel</Button>
        <Button onClick={onConfirm} variant="contained" endIcon={<i className='tabler-check' />}>
          {plan ? 'Update Plan' : 'Create Plan'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VipPlanDialog
