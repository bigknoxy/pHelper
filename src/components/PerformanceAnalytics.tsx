import { useState } from 'react'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  VStack,
  Flex,

  Spinner,
} from '@chakra-ui/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { usePersonalRecords, usePersonalRecordStats } from '../hooks/usePersonalRecords'
import { useExercises } from '../hooks/useExercises'
import { RecordType } from '../api/personalRecords'
import { useEnhancedWorkoutAnalytics, useExerciseAnalytics } from '../api/enhancedAnalytics'
import Card from './shared/Card'
import MuscleGroupBalance from './analytics/MuscleGroupBalance'
import WorkoutFrequency from './analytics/WorkoutFrequency'
import VolumeIntensity from './analytics/VolumeIntensity'

export default function PerformanceAnalytics() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('')
  const [selectedRecordType, setSelectedRecordType] = useState<RecordType>(RecordType.MAX_WEIGHT)

  const { records, isLoading: recordsLoading, error: recordsError } = usePersonalRecords({
    exerciseId: selectedExerciseId || undefined,
    recordType: selectedRecordType,
  })

  const { data: stats, isLoading: statsLoading, error: statsError } = usePersonalRecordStats(selectedExerciseId || undefined)

  const { exercises } = useExercises()
  const { data: workoutAnalytics } = useEnhancedWorkoutAnalytics()
  const { data: exerciseAnalytics } = useExerciseAnalytics()

  const chartData = records.map(record => ({
    date: new Date(record.date).toLocaleDateString(),
    value: record.value,
    exercise: record.exercise.name,
  }))

  const statsData = stats?.exerciseStats.map(stat => ({
    exercise: exercises.find(e => e.id === stat.exerciseId)?.name || 'Unknown',
    maxValue: stat._max.value,
    count: stat._count.id,
  })) || []

  const isLoading = recordsLoading || statsLoading

  if (recordsError || statsError) {
    return (
      <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
        <Text color="red.600">Failed to load performance analytics. Please try again.</Text>
      </Box>
    )
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Performance Analytics</Heading>
          <Text color="gray.600">
            Track your personal records and progress over time
          </Text>
        </Box>

        {/* Filters */}
        <Box>
          <HStack gap={4}>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #4A5568',
                backgroundColor: '#2D3748',
                color: 'white'
              }}
            >
              <option value="">All Exercises</option>
              {exercises.map(exercise => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
            <select
              value={selectedRecordType}
              onChange={(e) => setSelectedRecordType(e.target.value as RecordType)}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #4A5568',
                backgroundColor: '#2D3748',
                color: 'white'
              }}
            >
              <option value="MAX_WEIGHT">Max Weight</option>
              <option value="MAX_REPS">Max Reps</option>
              <option value="MAX_SETS">Max Sets</option>
              <option value="PERSONAL_BEST">Personal Best</option>
            </select>
          </HStack>
        </Box>

        {/* Charts */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          {/* Progress Chart */}
          <Box>
            <Heading size="md" mb={4}>Progress Over Time</Heading>
            {recordsLoading ? (
              <Flex justify="center" py={8}>
                <Spinner size="lg" color="teal.500" />
              </Flex>
            ) : chartData.length === 0 ? (
              <Text textAlign="center" py={8} color="gray.500">
                No data available for the selected filters.
              </Text>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#319795" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Box>

          {/* Workout Frequency */}
          <WorkoutFrequency />

          {/* Muscle Group Balance */}
          <MuscleGroupBalance />

          {/* Volume and Intensity */}
          <VolumeIntensity />

          {/* Exercise Stats */}
          <Box>
            <Heading size="md" mb={4}>Exercise Statistics</Heading>
            {statsLoading ? (
              <Flex justify="center" py={8}>
                <Spinner size="lg" color="teal.500" />
              </Flex>
            ) : statsData.length === 0 ? (
              <Text textAlign="center" py={8} color="gray.500">
                No statistics available.
              </Text>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="exercise" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="maxValue" fill="#319795" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </SimpleGrid>

        {/* Recent Records */}
        <Box>
          <Heading size="md" mb={4}>Recent Personal Records</Heading>
          {recordsLoading ? (
            <Flex justify="center" py={8}>
              <Spinner size="lg" color="teal.500" />
            </Flex>
          ) : records.length === 0 ? (
            <Text textAlign="center" py={8} color="gray.500">
              No recent records found.
            </Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
              {records.slice(0, 6).map(record => (
                <Box key={record.id} p={4} borderWidth={1} borderRadius="md" borderColor="gray.200">
                  <VStack gap={2} align="stretch">
                    <Text fontSize="sm" fontWeight="medium">
                      {record.exercise.name}
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="teal.500">
                      {record.value} {selectedRecordType === 'MAX_WEIGHT' ? 'lbs' : selectedRecordType === 'MAX_REPS' ? 'reps' : ''}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(record.date).toLocaleDateString()}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>
    </Box>
  )
}

interface OverviewCardProps {
  title: string
  value: string | number
  helpText?: string
}

function OverviewCard({ title, value, helpText }: OverviewCardProps) {
  return (
    <Card>
      <VStack gap={2} align="stretch" p={4}>
        <Text fontSize="sm" fontWeight="medium">{title}</Text>
        <Text fontSize="2xl" fontWeight="bold" color="teal.500">
          {value}
        </Text>
        {helpText && (
          <Text fontSize="xs" color="gray.600">
            {helpText}
          </Text>
        )}
      </VStack>
    </Card>
  )
}