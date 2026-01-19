// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CategoryListTable from './CategoryListTable'

const CategoryList = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CategoryListTable />
      </Grid>
    </Grid>
  )
}

export default CategoryList
