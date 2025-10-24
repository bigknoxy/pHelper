import { Box, Heading, Text, Flex } from '@chakra-ui/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEnhancedWorkoutAnalytics } from '../../api/enhancedAnalytics'

export default function WorkoutFrequency() {
  const { data: workoutAnalytics, isLoading, error } = useEnhancedWorkoutAnalytics()

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
        <Text color="red.600">Failed to load workout frequency. Please try again.</Text>
      </Box>
    )
  }

  const chartData = workoutAnalytics?.workoutFrequency.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    count: item.count,
    duration: item.total_duration,
  })) || []

  return (
    <Box>
      <Heading size="md" mb={4}>Workout Frequency</Heading>
      {isLoading ? (
        <Flex justify="center" py={8}>
          <Text>Loading...</Text>
        </Flex>
      ) : chartData.length === 0 ? (
        <Text textAlign="center" py={8} color="gray.500">
          No data available.
        </Text>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#319795" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  )
}