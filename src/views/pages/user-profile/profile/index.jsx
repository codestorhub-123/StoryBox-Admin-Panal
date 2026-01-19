// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import AboutOverview from './AboutOverview'

const ProfileTab = ({ data }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AboutOverview data={data} />
      </Grid>
    </Grid>
  )
}

export default ProfileTab
