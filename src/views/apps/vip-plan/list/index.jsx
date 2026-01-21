// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import VipPlanListTable from './VipPlanListTable'

const VipPlanList = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <VipPlanListTable />
      </Grid>
    </Grid>
  )
}

export default VipPlanList
