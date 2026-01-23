'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'

// Service Imports
import { getSettings, updateSettings } from '@/services/ApiService'

// Third-party Imports
import { toast } from 'react-toastify'

const SettingsView = () => {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [logoPreview, setLogoPreview] = useState('')

    // 🔥 ALL 20 FIELDS
    const [form, setForm] = useState({
        _id: '',
        appName: '',
        appLogo: null,
        appDescription: '',
        supportEmail: '',
        facebook: '',
        instagram: '',
        youtube: '',
        twitter: '',
        androidVersion: '',
        iosVersion: '',
        isForceUpdate: false,
        isMaintenanceMode: false,
        welcomeBonus: '',
        adDisplayInterval: '',
        privacyPolicy: '',
        termsAndConditions: '',
        createdAt: '',
        updatedAt: '',
        __v: 0
    })

    // 🌍 Base URL for image
    const baseUrl = (() => {
        try {
            const url = process.env.NEXT_PUBLIC_URL || ''
            if (!url) return ''
            const urlObj = new URL(url)
            return urlObj.origin
        } catch {
            const url = process.env.NEXT_PUBLIC_URL || ''
            return url.includes('/api') ? url.split('/api')[0] : url
        }
    })()

    // 📥 FETCH SETTINGS
    const fetchData = async () => {
        setLoading(true)
        try {
            const { ok, result } = await getSettings()
            if (ok && (result.success || result.status)) {
                const data = result.data || {}

                setForm({
                    _id: data._id || '',
                    appName: data.appName || '',
                    appLogo: null,
                    appDescription: data.appDescription || '',
                    supportEmail: data.supportEmail || '',
                    facebook: data.facebook || '',
                    instagram: data.instagram || '',
                    youtube: data.youtube || '',
                    twitter: data.twitter || '',
                    androidVersion: data.androidVersion || '',
                    iosVersion: data.iosVersion || '',
                    isForceUpdate: !!data.isForceUpdate,
                    isMaintenanceMode: !!data.isMaintenanceMode,
                    welcomeBonus: data.welcomeBonus ?? '',
                    adDisplayInterval: data.adDisplayInterval ?? '',
                    privacyPolicy: data.privacyPolicy || '',
                    termsAndConditions: data.termsAndConditions || '',
                    createdAt: data.createdAt || '',
                    updatedAt: data.updatedAt || '',
                    __v: data.__v ?? 0
                })

                if (data.appLogo) {
                    const cleanPath = data.appLogo.startsWith('/') ? data.appLogo.slice(1) : data.appLogo
                    const logoUrl = data.appLogo.startsWith('http')
                        ? data.appLogo
                        : `${baseUrl}/${cleanPath}`

                    setLogoPreview(logoUrl)
                } else {
                    setLogoPreview('')
                }
            }
        } catch {
            toast.error('Error fetching settings')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // ✍️ HANDLE CHANGE
    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    // 🖼️ LOGO CHANGE
    const handleLogoChange = e => {
        const file = e.target.files?.[0]
        if (file) {
            setForm(prev => ({ ...prev, appLogo: file }))
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    // 💾 SAVE SETTINGS
    const handleSubmit = async () => {
        const fd = new FormData()

        fd.append('appName', form.appName)
        fd.append('appDescription', form.appDescription)
        fd.append('supportEmail', form.supportEmail)
        fd.append('facebook', form.facebook)
        fd.append('instagram', form.instagram)
        fd.append('youtube', form.youtube)
        fd.append('twitter', form.twitter)
        fd.append('androidVersion', form.androidVersion)
        fd.append('iosVersion', form.iosVersion)
        fd.append('isForceUpdate', String(form.isForceUpdate))
        fd.append('isMaintenanceMode', String(form.isMaintenanceMode))
        fd.append('welcomeBonus', String(form.welcomeBonus))
        fd.append('adDisplayInterval', String(form.adDisplayInterval))
        fd.append('privacyPolicy', form.privacyPolicy)
        fd.append('termsAndConditions', form.termsAndConditions)

        if (form.appLogo) fd.append('appLogo', form.appLogo)

        setSaving(true)
        try {
            const { ok, result } = await updateSettings(fd)
            if (ok && (result.success || result.status)) {
                toast.success('Settings updated successfully')
                fetchData()
            } else {
                toast.error(result.message || 'Update failed')
            }
        } catch {
            toast.error('Error updating settings')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Card>
            <CardHeader title='Global Settings' />
            <CardContent>
                {loading ? (
                    <div className='flex justify-center p-6'>
                        <CircularProgress />
                    </div>
                ) : (
                    <>
                        {/* LOGO */}
                        <div className='flex items-center gap-4 mb-6'>
                            <CustomAvatar src={logoPreview} size={72} variant='rounded' />
                            <div className='flex items-center gap-3'>
                                <Button component='label' variant='outlined' size='small'>
                                    Upload Logo
                                    <input hidden type='file' accept='image/*' onChange={handleLogoChange} />
                                </Button>
                                {logoPreview ? (
                                    <Typography variant='body2' color='text.secondary'>Preview shown</Typography>
                                ) : (
                                    <Typography variant='body2' color='text.secondary'>No logo</Typography>
                                )}
                            </div>
                        </div>

                        <Grid container spacing={4}>
                            {/* TEXT FIELDS */}
                            {[
                                ['App Name', 'appName'],
                                ['Support Email', 'supportEmail'],
                                ['Facebook URL', 'facebook'],
                                ['Instagram URL', 'instagram'],
                                ['YouTube URL', 'youtube'],
                                ['Twitter URL', 'twitter'],
                                ['Android Version', 'androidVersion'],
                                ['iOS Version', 'iosVersion'],
                                ['Privacy Policy URL', 'privacyPolicy'],
                                ['Terms & Conditions URL', 'termsAndConditions']
                            ].map(([label, key]) => (
                                <Grid item xs={12} md={6} key={key}>
                                    <CustomTextField
                                        fullWidth
                                        label={label}
                                        value={form[key]}
                                        onChange={e => handleChange(key, e.target.value)}
                                        autoComplete='off'
                                    />
                                </Grid>
                            ))}

                            <Grid item xs={12}>
                                <CustomTextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label='App Description'
                                    value={form.appDescription}
                                    onChange={e => handleChange('appDescription', e.target.value)}
                                    autoComplete='off'
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <CustomTextField
                                    fullWidth
                                    type='number'
                                    label='Welcome Bonus'
                                    value={form.welcomeBonus}
                                    onChange={e => handleChange('welcomeBonus', e.target.value)}
                                    autoComplete='off'
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <CustomTextField
                                    fullWidth
                                    type='number'
                                    label='Ad Display Interval (sec)'
                                    value={form.adDisplayInterval}
                                    onChange={e => handleChange('adDisplayInterval', e.target.value)}
                                    autoComplete='off'
                                />
                            </Grid>
                        </Grid>
                    </>
                )}
            </CardContent>

            <CardActions className='p-6'>
                <Button variant='tonal' onClick={fetchData} disabled={saving || loading}>
                    Reset
                </Button>
                <Button variant='contained' onClick={handleSubmit} disabled={saving || loading}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </CardActions>
        </Card>
    )
}

export default SettingsView
