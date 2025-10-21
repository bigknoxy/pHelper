import { Box } from '@chakra-ui/react'
import { ResponsiveContainer } from 'recharts'
import { ReactNode, ReactElement } from 'react'

interface ChartContainerProps {
  title?: string
  height?: number | string
  // Accept either a React element (recommended for charts) or any renderable React node
  children: ReactElement | ReactNode
  loading?: boolean
}

export default function ChartContainer({ title, height = 200, children, loading }: ChartContainerProps) {
  return (
    <Box>
      {title && (
        <Box 
          color="gray.300" 
          fontSize="sm" 
          fontWeight="medium" 
          mb={3}
        >
          {title}
        </Box>
      )}
      <Box 
        bg="#1a1a1f" 
        p={4} 
        borderRadius="md" 
        border="1px solid" 
        borderColor="gray.700"
      >
        {loading ? (
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            height={height}
            color="gray.500"
          >
            Loading chart...
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {children as ReactElement}
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  )
}
