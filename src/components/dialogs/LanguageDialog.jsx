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

const LanguageDialog = ({ open, setOpen, language, handleSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    isActive: true
  })

  const [errors, setErrors] = useState({
    name: ''
  })

  useEffect(() => {
    if (language && open) {
      setFormData({
        name: language.name || '',
        isActive: language.isActive ?? true
      })
    } else {
      setFormData({
        name: '',
        isActive: true
      })
    }
  }, [language, open])

  const handleClose = () => {
    setOpen(false)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const onConfirm = () => {
    if (!formData.name.trim()) {
      setErrors({ name: 'Name is required' })
      return
    }

    setErrors({ name: '' })
    handleSave(language?._id, formData)
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
        <Typography variant='h5'>{language ? 'Edit Language' : 'Add New Language'}</Typography>
        <IconButton onClick={handleClose} size='small'>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>
      <DialogContent className='pli-4 pbs-4 pbe-4'>
        <Box className="flex flex-col gap-4 p-4">
          <CustomTextField
            fullWidth
            autoComplete='off'
            label="Language Name"
            name="name"
            placeholder="e.g. Marathi"  
            value={formData.name}
            onChange={onChange}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
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
          {language ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LanguageDialog
