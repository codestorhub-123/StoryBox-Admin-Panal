// MUI Imports
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'

const TablePaginationComponent = ({ table }) => {
  // Prefer server-side total rowCount if provided (for manual/server pagination)
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const totalRows = table.options.rowCount ?? table.getFilteredRowModel().rows.length
  const currentPageRows = table.getRowModel().rows.length

  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const to = totalRows === 0 ? 0 : Math.min(pageIndex * pageSize + currentPageRows, totalRows)
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))

  return (
    <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
      <Typography color='text.disabled'>
        {`Showing ${from} to ${to} of ${totalRows} entries`}
      </Typography>
      <Pagination
        shape='rounded'
        color='primary'
        variant='tonal'
        count={totalPages}
        page={pageIndex + 1}
        onChange={(_, page) => {
          table.setPageIndex(page - 1)
        }}
        showFirstButton
        showLastButton
      />
    </div>
  )
}

export default TablePaginationComponent
