// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import OrderHistoryTable from './OrderHistoryTable'

const OrderHistory = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <OrderHistoryTable />
      </Grid>
    </Grid>
  )
}

export default OrderHistory
