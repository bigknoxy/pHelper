import React from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { getWeightGoals } from '../../api/weightGoals'
import { getWeights } from '../../api/weights'

const GoalProgressTracker: React.FC = () => {
  const { data: goals } = useQuery({
    queryKey: ['weightGoals'],
    queryFn: getWeightGoals,
  })

  const { data: weights } = useQuery({
    queryKey: ['weights'],
    queryFn: getWeights,
  })

  if (!goals || !weights) return <Text>Loading...</Text>

  const activeGoal = goals.find(g => !g.milestones.some(m => m.achieved))
  if (!activeGoal) return <Text>No active goals</Text>

  const latestWeight = weights[0]?.weight || 0
  const progress = Math.min(100, ((activeGoal.goalWeight - latestWeight) / (activeGoal.goalWeight - latestWeight)) * 100) // Simplified

  return (
    <Box p={4} borderWidth={1} borderRadius="md">
      <VStack gap={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">Goal Progress</Text>
        <HStack justify="space-between">
          <Text>Current: {latestWeight} lbs</Text>
          <Text>Goal: {activeGoal.goalWeight} lbs</Text>
        </HStack>
        <Box>
          <Text>Progress: {Math.round(progress)}%</Text>
          <Box bg="gray.200" h="4" borderRadius="md">
            <Box bg="teal.500" h="4" w={`${progress}%`} borderRadius="md" />
          </Box>
        </Box>
      </VStack>
    </Box>
  )
}

export default GoalProgressTracker