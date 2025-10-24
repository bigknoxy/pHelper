import { Box, Heading, Text, Flex } from '@chakra-ui/react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useExerciseAnalytics } from '../../api/enhancedAnalytics'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0']

export default function MuscleGroupBalance() {
  const { data: exerciseAnalytics, isLoading, error } = useExerciseAnalytics()

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
        <Text color="red.600">Failed to load muscle group balance. Please try again.</Text>
      </Box>
    )
  }

  const chartData = exerciseAnalytics?.muscleGroups.map((group, index) => ({
    name: group.muscle_group,
    value: group.total_sets,
    color: COLORS[index % COLORS.length],
  })) || []

  return (
    <Box>
      <Heading size="md" mb={4}>Muscle Group Balance</Heading>
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
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Box>
  )
}