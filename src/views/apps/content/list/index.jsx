// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import ContentListTable from './ContentListTable'

const ContentList = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ContentListTable />
      </Grid>
    </Grid>
  )
}

export default ContentList
