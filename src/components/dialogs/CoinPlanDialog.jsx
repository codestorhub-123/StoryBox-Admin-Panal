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
    } else {
      setFormData({
        name: '',
        price: '',
        offerPrice: '',
        coin: '',
        bonusCoin: '',
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
      // Validate or convert types if needed
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
                />
                <Box className="flex gap-4">
                    <CustomTextField
                        fullWidth
                        autoComplete='off'
                        label="Original Price"
                        name="price"
                        type="number"
                        placeholder="500"
                        value={formData.price}
                        onChange={onChange}
                    />
                    <CustomTextField
                        fullWidth
                        autoComplete='off'
                        label="Offer Price"
                        name="offerPrice"
                        type="number"
                        placeholder="299"
                        value={formData.offerPrice}
                        onChange={onChange}
                    />
                </Box>
                <Box className="flex gap-4">
                    <CustomTextField
                        fullWidth
                        autoComplete='off'
                        label="Coin Amount"
                        name="coin"
                        type="number"
                        placeholder="1000"
                        value={formData.coin}
                        onChange={onChange}
                    />
                    <CustomTextField
                        fullWidth
                        autoComplete='off'
                        label="Bonus Coins"
                        name="bonusCoin"
                        type="number"
                        placeholder="250"
                        value={formData.bonusCoin}
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

export default CoinPlanDialog
