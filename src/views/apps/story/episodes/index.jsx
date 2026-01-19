// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import EpisodeListTable from './EpisodeListTable'

const EpisodeList = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <EpisodeListTable />
      </Grid>
    </Grid>
  )
}

export default EpisodeList
