// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import StoryListTable from './StoryListTable'

const StoryList = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <StoryListTable />
      </Grid>
    </Grid>
  )
}

export default StoryList
