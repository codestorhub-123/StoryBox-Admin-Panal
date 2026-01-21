'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'

// Component Imports
import AdRewardListTable from './AdRewardListTable'
import DailyRewardListTable from './DailyRewardListTable'

const RewardList = () => {
  // States
  const [activeTab, setActiveTab] = useState('ads')

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent className='flex gap-4 p-4'>
            <Button 
                variant={activeTab === 'ads' ? 'contained' : 'text'}
                color={activeTab === 'ads' ? 'error' : 'secondary'}
                onClick={() => setActiveTab('ads')}
                sx={{ 
                    borderRadius: '8px',
                    textTransform: 'none',
                    px: 6,
                    py: 2,
                    fontWeight: 500,
                    fontSize: '1rem',
                    color: activeTab === 'ads' ? '#fff' : 'text.secondary',
                    bgcolor: activeTab === 'ads' ? 'error.main' : 'transparent',
                    '&:hover': {
                        bgcolor: activeTab === 'ads' ? 'error.dark' : 'rgba(0,0,0,0.04)'
                    }
                }}
            >
              Ads Coin Reward
            </Button>
            <Button 
                variant={activeTab === 'daily' ? 'contained' : 'text'}
                color={activeTab === 'daily' ? 'error' : 'secondary'}
                onClick={() => setActiveTab('daily')}
                sx={{ 
                    borderRadius: '8px',
                    textTransform: 'none',
                    px: 6,
                    py: 2,
                    fontWeight: 500,
                    fontSize: '1rem',
                    color: activeTab === 'daily' ? '#fff' : 'text.secondary',
                    bgcolor: activeTab === 'daily' ? 'error.main' : 'transparent',
                    '&:hover': {
                        bgcolor: activeTab === 'daily' ? 'error.dark' : 'rgba(0,0,0,0.04)'
                    }
                }}
            >
              Daily Coin Reward
            </Button>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        {activeTab === 'ads' ? <AdRewardListTable /> : <DailyRewardListTable />}
      </Grid>
    </Grid>
  )
}

export default RewardList
