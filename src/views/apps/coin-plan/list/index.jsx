// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CoinPlanListTable from './CoinPlanListTable'

const CoinPlanList = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CoinPlanListTable />
      </Grid>
    </Grid>
  )
}

export default CoinPlanList
