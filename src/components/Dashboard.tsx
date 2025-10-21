import { useState, ChangeEvent, useMemo } from 'react';
import { Box, SimpleGrid, Text, useBreakpointValue, Heading } from "@chakra-ui/react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useWeights } from "../hooks/useWeights";
import { useWorkouts } from "../hooks/useWorkouts";
import { useTasks } from "../hooks/useTasks";
import { WeightEntry } from "../api/weights";
import { WorkoutEntry } from "../api/workouts";
import { Task } from "../api/tasks";
import Card from "./shared/Card";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import ChartContainer from "./shared/ChartContainer";
import Button from "./shared/Button";

export default function Dashboard() {
  const { weights = [], isLoading: weightsLoading, error: weightsError } = useWeights()
  const { workouts = [], isLoading: workoutsLoading, error: workoutsError } = useWorkouts()
  const { tasks = [], isLoading: tasksLoading, error: tasksError } = useTasks()

  const isLoading = weightsLoading || workoutsLoading || tasksLoading
  const error = weightsError || workoutsError || tasksError

  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('7')
  const gridCols = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 })

  const handleTimeRangeChange = (e: ChangeEvent<HTMLSelectElement>) => setTimeRange(e.target.value as '7' | '30' | '90')

  // compute metrics (last 7 days) - memoized for performance
  const metrics = useMemo(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const last7Weights = (weights || []).filter((w: WeightEntry) => w.date >= sevenDaysAgo)
    const latestWeight = last7Weights.length > 0 ? last7Weights[last7Weights.length - 1].weight : null
    const weightTrend = last7Weights.length > 1 ? last7Weights[last7Weights.length - 1].weight - last7Weights[0].weight : 0

    const totalWorkouts = (workouts || []).length
    const lastWorkout = (workouts && workouts.length > 0) ? workouts[workouts.length - 1].date : null
    const workoutTypes = (workouts || []).map((w: WorkoutEntry) => w.type)
    const mostFrequentWorkout = workoutTypes.length > 0 ? workoutTypes.reduce((a: string, b: string) =>
      workoutTypes.filter(v => v === a).length >= workoutTypes.filter(v => v === b).length ? a : b
    ) : null

    const totalTasks = (tasks || []).length
    const completedTasks = (tasks || []).filter((t: Task) => Boolean(t.completed)).length
    const pendingTasks = totalTasks - completedTasks

    return {
      latestWeight,
      weightTrend,
      totalWorkouts,
      lastWorkout,
      mostFrequentWorkout,
      totalTasks,
      completedTasks,
      pendingTasks,
      last7Weights
    }
  }, [weights, workouts, tasks])

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  if (error) {
    const message = (error as Error)?.message || 'Failed to load dashboard data. Please try again later.'
    return <ErrorMessage title="Dashboard Error" message={message} />
  }

  const exportData = () => {
    const data = {
      weights,
      workouts,
      tasks,
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fitness-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

   const {
     latestWeight,
     weightTrend,
     totalWorkouts,
     lastWorkout,
     mostFrequentWorkout,
     totalTasks,
     completedTasks,
     pendingTasks,
     last7Weights
   } = metrics

   return (
     <Box p={{ base: 4, md: 6 }}>
       <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
         <Heading as="h1" size="lg" color="white">Fitness Dashboard</Heading>
         <Box display="flex" gap={3} alignItems="center">
           <label htmlFor="time-range-select" style={{ display: 'none' }}>Time range</label>
           <select
             id="time-range-select"
             value={timeRange}
             onChange={handleTimeRangeChange}
             style={{ background: 'surface.900', color: 'text.inverted', borderColor: 'muted.700', padding: '6px 10px', borderRadius: 6 }}
           >
             <option value="7">Last 7 days</option>
             <option value="30">Last 30 days</option>
             <option value="90">Last 90 days</option>
           </select>
           <Button
             onClick={exportData}
             size="sm"
             colorScheme="teal"
             variant="outline"
             aria-label="Export dashboard data"
           >
             Export Data
           </Button>
         </Box>
       </Box>

       <SimpleGrid columns={gridCols} gap={4}>
         <Card variant="highlighted" as="section" aria-labelledby="latest-weight-heading">
           <Text id="latest-weight-heading" fontSize="lg" color="gray.400" mb={2}>Latest Weight</Text>
           <Text fontSize="3xl" color="primary.500" fontWeight="bold">
             {latestWeight ? `${latestWeight} lb` : 'No data'}
           </Text>
           <Text fontSize="sm" color="gray.500" mt={1}>
             Last 7 days: {weightTrend >= 0 ? '+' : ''}{weightTrend} lb
           </Text>

           {last7Weights.length > 0 && (
             <Box mt={3}>
               <ChartContainer title="Weight Trend" height={100}>
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={last7Weights}>
                     <CartesianGrid strokeDasharray="3 3" stroke="muted.700" />
                     <XAxis
                       dataKey="date"
                       stroke="#9CA3AF"
                       fontSize={10}
                       tickFormatter={(value) => new Date(value).toLocaleDateString()}
                     />
                     <YAxis
                       stroke="#9CA3AF"
                       fontSize={10}
                       domain={["dataMin - 2", "dataMax + 2"]}
                     />
                     <Tooltip
                       contentStyle={{
                         backgroundColor: '#1F2937',
                         border: '1px solid #374151',
                         borderRadius: '6px'
                       }}
                       labelStyle={{ color: '#F3F4F6' }}
                     />
                     <Line
                       type="monotone"
                       dataKey="weight"
                       stroke="primary.500"
                       strokeWidth={2}
                       dot={{ fill: 'primary.500', r: 3 }}
                       activeDot={{ r: 5 }}
                     />
                   </LineChart>
                 </ResponsiveContainer>
               </ChartContainer>
             </Box>
           )}
         </Card>

         <Card as="section" aria-labelledby="workouts-heading">
           <Text id="workouts-heading" fontSize="lg" color="gray.400" mb={2}>Total Workouts</Text>
           <Text fontSize="3xl" color="primary.500" fontWeight="bold">
             {totalWorkouts}
           </Text>
           <Text fontSize="sm" color="gray.500" mt={1}>
             Last: {lastWorkout || 'No data'}
           </Text>
           <Text fontSize="sm" color="gray.500">
             Most frequent: {mostFrequentWorkout || 'No data'}
           </Text>
         </Card>

         <Card as="section" aria-labelledby="tasks-heading">
           <Text id="tasks-heading" fontSize="lg" color="gray.400" mb={2}>Task Progress</Text>
           <Text fontSize="3xl" color="primary.500" fontWeight="bold">
             {completedTasks}/{totalTasks}
           </Text>
           <Text fontSize="sm" color="gray.500" mt={1}>
             Pending: {pendingTasks}
           </Text>
           {totalTasks > 0 && (
             <Box mt={3}>
               <Box bg="surface.800" borderRadius="md" overflow="hidden">
                 <Box
                   h={4}
                   bg="primary.500"
                   style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                   transition="width 0.3s ease"
                 />
               </Box>
               <Text fontSize="xs" color="gray.500" mt={1}>
                 {Math.round((completedTasks / totalTasks) * 100)}% complete
               </Text>
             </Box>
           )}
         </Card>

         <Card as="section" aria-labelledby="quick-stats-heading">
           <Text id="quick-stats-heading" fontSize="lg" color="gray.400" mb={2}>Quick Stats</Text>
           <Box>
             <Text fontSize="sm" color="gray.300" mb={1}>
               🏃‍♂️ Workouts this week: {(workouts || []).filter((w: WorkoutEntry) => {
                 const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                 return new Date(w.date) >= weekAgo;
               }).length}
             </Text>
             <Text fontSize="sm" color="gray.300" mb={1}>
               📋 Tasks completed today: {(tasks || []).filter((t: Task) => {
                 const today = new Date().toDateString();
                 return Boolean(t.completed) && new Date(t.createdAt || '').toDateString() === today;
               }).length}
             </Text>
             <Text fontSize="sm" color="gray.300">
               🎯 Goal streak: 3 days
             </Text>
           </Box>
         </Card>
       </SimpleGrid>
     </Box>
   )
}
