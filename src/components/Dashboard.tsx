import React, { useMemo } from 'react'
import {
  Box,
  SimpleGrid,
  Text,
  useBreakpointValue,
  Heading,
  VStack,
  HStack,
  Badge,
  IconButton
} from "@chakra-ui/react"
import { Settings, TrendingUp, Target, Award } from "lucide-react"
import { useWeights } from "../hooks/useWeights"
import { useWorkouts } from "../hooks/useWorkouts"
import { useTasks } from "../hooks/useTasks"
import {
  useWeightAnalytics,
  useWorkoutAnalytics,
  useTaskAnalytics,
  useDashboardOverview,
  useInvalidateAnalytics
} from "../hooks/useAnalytics"
import { useGoalAnalytics } from "../hooks/useGoals"
import { useDashboardStore, TimeRange } from "../stores/dashboardStore"
import Card from "./shared/Card"
import LoadingSpinner from "./shared/LoadingSpinner"
import ErrorMessage from "./shared/ErrorMessage"
import InteractiveChart from "./charts/InteractiveChart"
import GoalProgressIndicator from "./charts/GoalProgressIndicator"
import PersonalRecords from "./charts/PersonalRecords"

export default function Dashboard() {
  // Dashboard store for state management
  const {
    timeRange,
    chartType,
    selectedMetrics,
    showMovingAverage,
    showTrendLine,
    setTimeRange
  } = useDashboardStore()

   // Analytics hooks
   const { data: weightAnalytics, isLoading: weightLoading, error: weightError } = useWeightAnalytics(timeRange)
   const { data: workoutAnalytics, isLoading: workoutLoading, error: workoutError } = useWorkoutAnalytics(timeRange)
   const { data: taskAnalytics, isLoading: taskLoading, error: taskError } = useTaskAnalytics(timeRange)
   const { data: overview, isLoading: overviewLoading, error: overviewError } = useDashboardOverview(timeRange)
   const { data: goals, isLoading: goalsLoading, error: goalsError } = useGoalAnalytics()
   const { invalidateAllAnalytics } = useInvalidateAnalytics()

  // Legacy hooks for basic data (keeping for compatibility)
  const { weights = [], isLoading: weightsLoading } = useWeights()
  const { workouts = [], isLoading: workoutsLoading } = useWorkouts()
  const { tasks = [], isLoading: tasksLoading } = useTasks()

   const isLoading = weightsLoading || workoutsLoading || tasksLoading || weightLoading || workoutLoading || taskLoading || overviewLoading || goalsLoading
   const error = weightError || workoutError || taskError || overviewError || goalsError

  const gridCols = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 })

   // Transform real goals data for the component
   const realGoals = useMemo(() => {
     if (!goals) return []

     return goals.map(goal => ({
       id: goal.id,
       title: goal.title,
       target: goal.target,
       current: goal.current,
       unit: goal.unit,
       category: goal.category.toLowerCase() as 'weight' | 'workouts' | 'tasks',
       status: goal.status.toLowerCase() as 'active' | 'completed' | 'paused' | 'cancelled',
       deadline: goal.deadline || undefined
     }))
   }, [goals])

   // Transform real analytics data into personal records format
   const realRecords = useMemo(() => {
     const records: Array<{
       id: string
       type: 'weight' | 'workout' | 'task'
       title: string
       value: number | string
       unit: string
       date: string
       description?: string
     }> = []

     // Weight records
     if (weightAnalytics?.personalRecords) {
       const { personalRecords } = weightAnalytics

       if (personalRecords.heaviest) {
         records.push({
           id: 'weight-heaviest',
           type: 'weight',
           title: 'Heaviest Weight',
           value: personalRecords.heaviest,
           unit: 'lbs',
           date: 'All time',
           description: 'Personal best weight'
         })
       }

       if (personalRecords.lightest) {
         records.push({
           id: 'weight-lightest',
           type: 'weight',
           title: 'Lightest Weight',
           value: personalRecords.lightest,
           unit: 'lbs',
           date: 'All time',
           description: 'Personal best weight'
         })
       }

       if (personalRecords.biggestLoss && personalRecords.biggestLoss < 0) {
         records.push({
           id: 'weight-biggest-loss',
           type: 'weight',
           title: 'Biggest Loss',
           value: Math.abs(personalRecords.biggestLoss),
           unit: 'lbs',
           date: 'All time',
           description: 'Best weight loss in one period'
         })
       }
     }

     // Workout records
     if (workoutAnalytics?.personalRecords) {
       const { personalRecords } = workoutAnalytics

       if (personalRecords.longestWorkout) {
         records.push({
           id: 'workout-longest',
           type: 'workout',
           title: 'Longest Workout',
           value: personalRecords.longestWorkout,
           unit: 'minutes',
           date: 'All time',
           description: 'Personal best workout duration'
         })
       }

       if (personalRecords.mostWorkoutsInDay) {
         records.push({
           id: 'workout-most-in-day',
           type: 'workout',
           title: 'Most Workouts in a Day',
           value: personalRecords.mostWorkoutsInDay,
           unit: 'count',
           date: 'All time',
           description: 'Most productive workout day'
         })
       }

       if (personalRecords.longestStreak) {
         records.push({
           id: 'workout-longest-streak',
           type: 'workout',
           title: 'Longest Workout Streak',
           value: personalRecords.longestStreak,
           unit: 'days',
           date: 'All time',
           description: 'Longest consecutive workout streak'
         })
       }
     }

     // Task records
     if (taskAnalytics?.personalRecords) {
       const { personalRecords } = taskAnalytics

       if (personalRecords.mostTasksCompletedInDay) {
         records.push({
           id: 'task-most-in-day',
           type: 'task',
           title: 'Most Tasks in a Day',
           value: personalRecords.mostTasksCompletedInDay,
           unit: 'count',
           date: 'All time',
           description: 'Most productive task day'
         })
       }

       if (personalRecords.longestTaskStreak) {
         records.push({
           id: 'task-longest-streak',
           type: 'task',
           title: 'Longest Task Streak',
           value: personalRecords.longestTaskStreak,
           unit: 'days',
           date: 'All time',
           description: 'Longest consecutive task completion streak'
         })
       }
     }

     return records
   }, [weightAnalytics, workoutAnalytics, taskAnalytics])

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange)
  }

  const handleRefreshData = () => {
    invalidateAllAnalytics()
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading enhanced dashboard..." />
  }

  if (error) {
    const message = (error as Error)?.message || 'Failed to load dashboard data. Please try again later.'
    return <ErrorMessage title="Dashboard Error" message={message} />
  }

  return (
    <Box p={{ base: 4, md: 6 }}>
      {/* Header */}
      <VStack gap={6} align="stretch">
        <HStack justify="space-between" align="center">
          <HStack gap={3}>
            <Heading as="h1" size="lg" color="text.primary">
              Enhanced Fitness Dashboard
            </Heading>
            <Badge colorScheme="blue" variant="subtle">
              Phase 2
            </Badge>
          </HStack>

          <HStack gap={3}>
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              style={{
                background: 'var(--chakra-colors-surface-50)',
                border: '1px solid var(--chakra-colors-muted-200)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '14px',
                maxWidth: '150px',
                cursor: 'pointer'
              }}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
              <option value="all">All time</option>
            </select>

            <IconButton
              aria-label="Refresh data"
              size="sm"
              variant="outline"
              bg="surface.50"
              onClick={handleRefreshData}
            >
              <Settings size={16} />
            </IconButton>
          </HStack>
        </HStack>

        {/* Overview Cards */}
        <SimpleGrid columns={gridCols} gap={4}>
          <Card as="section" aria-labelledby="overview-weight">
            <VStack gap={2} align="stretch">
              <HStack gap={2}>
                <TrendingUp size={20} color="#3182CE" />
                <Text id="overview-weight" fontSize="lg" fontWeight="semibold" color="text.primary">
                  Weight Trend
                </Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="primary.500">
                {overview?.overview?.latestWeight ? `${overview.overview.latestWeight} lbs` : 'No data'}
              </Text>
              <Text fontSize="sm" color="text.secondary">
                {overview?.overview?.weightChange ? (overview.overview.weightChange >= 0 ? '+' : '') + overview.overview.weightChange + ' lbs change' : 'No change data'}
              </Text>
            </VStack>
          </Card>

          <Card as="section" aria-labelledby="overview-workouts">
            <VStack gap={2} align="stretch">
              <HStack gap={2}>
                <Target size={20} color="#38A169" />
                <Text id="overview-workouts" fontSize="lg" fontWeight="semibold" color="text.primary">
                  Workouts
                </Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="primary.500">
                {overview?.overview?.totalWorkouts || 0}
              </Text>
              <Text fontSize="sm" color="text.secondary">
                {overview?.overview?.totalDuration || 0} minutes total
              </Text>
            </VStack>
          </Card>

          <Card as="section" aria-labelledby="overview-tasks">
            <VStack gap={2} align="stretch">
              <HStack gap={2}>
                <Award size={20} color="#D69E2E" />
                <Text id="overview-tasks" fontSize="lg" fontWeight="semibold" color="text.primary">
                  Tasks
                </Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="primary.500">
                {overview?.overview?.completedTasks || 0}/{overview?.overview?.totalTasks || 0}
              </Text>
              <Text fontSize="sm" color="text.secondary">
                {overview?.overview?.completionRate ? overview.overview.completionRate.toFixed(1) : 0}% complete
              </Text>
            </VStack>
          </Card>

          <Card as="section" aria-labelledby="overview-streak">
            <VStack gap={2} align="stretch">
              <Text id="overview-streak" fontSize="lg" fontWeight="semibold" color="text.primary">
                Current Streaks
              </Text>
              <VStack gap={1} align="stretch">
                <Text fontSize="sm" color="text.secondary">
                  Workout streak: {workoutAnalytics?.summary?.streak || 0} days
                </Text>
                <Text fontSize="sm" color="text.secondary">
                  Task streak: {taskAnalytics?.personalRecords?.currentTaskStreak || 0} days
                </Text>
              </VStack>
            </VStack>
          </Card>
        </SimpleGrid>

        {/* Charts Section */}
        <VStack gap={6} align="stretch">
          <Text fontSize="xl" fontWeight="semibold" color="text.primary">
            Analytics Charts
          </Text>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            {selectedMetrics.includes('weight') && weightAnalytics?.data && (
              <Card>
                <InteractiveChart
                  data={weightAnalytics.data.map(d => ({ date: d.date, weight: d.weight }))}
                  chartType={chartType}
                  title="Weight Trend"
                  height={300}
                  showMovingAverage={showMovingAverage}
                  showTrendLine={showTrendLine}
                  movingAverageData={weightAnalytics.movingAverages}
                  formatXAxis={(value) => new Date(value).toLocaleDateString()}
                  formatYAxis={(value) => `${value} lbs`}
                />
              </Card>
            )}

            {selectedMetrics.includes('workouts') && workoutAnalytics?.data && (
              <Card>
                <InteractiveChart
                  data={workoutAnalytics.data.map(d => ({ date: d.date, duration: d.duration }))}
                  chartType={chartType}
                  title="Workout Duration"
                  height={300}
                  showMovingAverage={showMovingAverage}
                  showTrendLine={showTrendLine}
                  formatXAxis={(value) => new Date(value).toLocaleDateString()}
                  formatYAxis={(value) => `${value} min`}
                />
              </Card>
            )}
          </SimpleGrid>
        </VStack>

         {/* Goals Section */}
         <VStack gap={4} align="stretch">
           <Text fontSize="xl" fontWeight="semibold" color="text.primary">
             Goals & Progress
           </Text>
           <GoalProgressIndicator goals={realGoals} />
         </VStack>

         {/* Personal Records Section */}
         <VStack gap={4} align="stretch">
           <Text fontSize="xl" fontWeight="semibold" color="text.primary">
             Personal Records
           </Text>
           <PersonalRecords records={realRecords} />
         </VStack>
      </VStack>
    </Box>
  )
}
