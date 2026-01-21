// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import LanguageListTable from './LanguageListTable'

const LanguageList = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <LanguageListTable />
      </Grid>
    </Grid>
  )
}

export default LanguageList
