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

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const CoinPlanDialog = ({ open, setOpen, plan, handleSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    offerPrice: '',
    coin: '',
    bonusCoin: '',
    isActive: true
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (plan && open) {
      setFormData({
        name: plan.name || '',
        price: plan.price || '',
        offerPrice: plan.offerPrice || '',
        coin: plan.coin || '',
        bonusCoin: plan.bonusCoin || '',
        isActive: plan.isActive ?? true
      })
      setErrors({})
    } else {
      setFormData({
        name: '',
        price: '',
        offerPrice: '',
        coin: '',
        bonusCoin: '',
        isActive: true
      })
      setErrors({})
    }
  }, [plan, open])

  const handleClose = () => {
    setOpen(false)
    setErrors({})
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const onConfirm = () => {
    // Validate
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Plan Name is required'
    if (!String(formData.price).trim()) newErrors.price = 'Price is required'
    if (!String(formData.offerPrice).trim()) newErrors.offerPrice = 'Offer Price is required'
    if (!String(formData.coin).trim()) newErrors.coin = 'Coin amount is required'
    if (!String(formData.bonusCoin).trim()) newErrors.bonusCoin = 'Bonus Coin is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const dataToSave = {
      ...formData,
      price: Number(formData.price),
      offerPrice: Number(formData.offerPrice),
      coin: Number(formData.coin),
      bonusCoin: Number(formData.bonusCoin)
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
        <Typography variant='h5'>{plan ? 'Edit Coin Plan' : 'Add New Coin Plan'}</Typography>
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
            placeholder="e.g. Premium Pack"
            value={formData.name}
            onChange={onChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <Box className="flex gap-4">
            <CustomTextField
              fullWidth
              autoComplete='off'
              label="Original Price"
              name="price"
              placeholder="500"
              value={formData.price}
              onChange={onChange}
              error={!!errors.price}
              helperText={errors.price}
            />
            <CustomTextField
              fullWidth
              autoComplete='off'
              label="Offer Price"
              name="offerPrice"
              placeholder="299"
              value={formData.offerPrice}
              onChange={onChange}
              error={!!errors.offerPrice}
              helperText={errors.offerPrice}
            />
          </Box>
          <Box className="flex gap-4">
            <CustomTextField
              fullWidth
              autoComplete='off'
              label="Coin Amount"
              name="coin"
              placeholder="1000"
              value={formData.coin}
              onChange={onChange}
              error={!!errors.coin}
              helperText={errors.coin}
            />
            <CustomTextField
              fullWidth
              autoComplete='off'
              label="Bonus Coins"
              name="bonusCoin"
              placeholder="250"
              value={formData.bonusCoin}
              onChange={onChange}
              error={!!errors.bonusCoin}
              helperText={errors.bonusCoin}
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

export default CoinPlanDialog
