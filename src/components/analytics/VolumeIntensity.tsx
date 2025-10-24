import { Box, Heading, Text, Flex } from '@chakra-ui/react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useExerciseAnalytics } from '../../api/enhancedAnalytics'

export default function VolumeIntensity() {
  const { data: exerciseAnalytics, isLoading, error } = useExerciseAnalytics()

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
        <Text color="red.600">Failed to load volume and intensity. Please try again.</Text>
      </Box>
    )
  }

  const chartData = exerciseAnalytics?.topExercises.slice(0, 10).map(exercise => ({
    name: exercise.name,
    totalSets: exercise.total_sets,
    avgWeight: exercise.avg_weight,
  })) || []

  return (
    <Box>
      <Heading size="md" mb={4}>Volume and Intensity</Heading>
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
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalSets" fill="#319795" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  )
}