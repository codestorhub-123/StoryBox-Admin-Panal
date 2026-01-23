'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

const ReportReasonDialog = ({ open, setOpen, reason, handleSave }) => {
    const [formData, setFormData] = useState({
        title: ''
    })

    useEffect(() => {
        if (reason) {
            setFormData({
                title: reason.title || ''
            })
        } else {
            setFormData({
                title: ''
            })
        }
    }, [reason, open])

    const handleClose = () => {
        setOpen(false)
        setFormData({ title: '' })
    }

    const handleSubmit = () => {
        if (!formData.title.trim()) {
            return
        }
        handleSave(reason?._id, formData)
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
            <DialogTitle>{reason ? 'Edit Report Reason' : 'Add Report Reason'}</DialogTitle>
            <DialogContent>
                <div className='flex flex-col gap-4 mt-4'>
                    <TextField
                        label='Title'
                        fullWidth
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder='e.g., Nudity or sexual activity'
                        required
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color='secondary'>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant='contained'
                    disabled={!formData.title.trim()}
                >
                    {reason ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ReportReasonDialog
