import React from 'react'
import { Box, Text, VStack, HStack, Badge, Icon } from '@chakra-ui/react'
import { Target, TrendingUp, Award } from 'lucide-react'

interface Goal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  category: 'weight' | 'workouts' | 'tasks'
  deadline?: string
  status: 'active' | 'completed' | 'overdue' | 'paused' | 'cancelled'
}

interface GoalProgressIndicatorProps {
  goals: Goal[]
  showCompleted?: boolean
}

const GoalProgressIndicator: React.FC<GoalProgressIndicatorProps> = ({
  goals,
  showCompleted = true
}) => {
  const activeGoals = goals.filter(goal =>
    showCompleted || goal.status === 'active'
  )

  if (activeGoals.length === 0) {
    return (
      <Box
        p={6}
        textAlign="center"
        bg="surface.50"
        borderRadius="md"
        border="1px solid"
        borderColor="muted.200"
      >
        <Icon as={Target} boxSize={48} color="muted.400" mb={3} />
        <Text color="text.secondary" fontSize="lg">
          No active goals
        </Text>
        <Text color="text.muted" fontSize="sm">
          Set some fitness goals to track your progress!
        </Text>
      </Box>
    )
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'green'
    if (percentage >= 75) return 'blue'
    if (percentage >= 50) return 'orange'
    return 'red'
  }

  const getStatusBadge = (goal: Goal) => {
    switch (goal.status) {
      case 'completed':
        return <Badge colorScheme="green" size="sm">Completed</Badge>
      case 'overdue':
        return <Badge colorScheme="red" size="sm">Overdue</Badge>
      case 'paused':
        return <Badge colorScheme="yellow" size="sm">Paused</Badge>
      case 'cancelled':
        return <Badge colorScheme="gray" size="sm">Cancelled</Badge>
      default:
        return <Badge colorScheme="blue" size="sm">Active</Badge>
    }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === 'count') return value.toLocaleString()
    return `${value} ${unit}`
  }

  return (
    <VStack gap={4} align="stretch">
      {activeGoals.map((goal) => {
        const percentage = Math.min((goal.current / goal.target) * 100, 100)
        const isCompleted = percentage >= 100

        return (
          <Box
            key={goal.id}
            p={4}
            bg="surface.50"
            borderRadius="md"
            border="1px solid"
            borderColor="muted.200"
            position="relative"
          >
            <VStack gap={3} align="stretch">
              <HStack justify="space-between" align="flex-start">
                <HStack gap={2}>
                  <Icon
                    as={goal.category === 'weight' ? Target : goal.category === 'workouts' ? TrendingUp : Award}
                    boxSize={20}
                    color="primary.500"
                  />
                  <VStack gap={0} align="flex-start">
                    <Text fontSize="md" fontWeight="semibold" color="text.primary">
                      {goal.title}
                    </Text>
                    <Text fontSize="sm" color="text.secondary">
                      {formatValue(goal.current, goal.unit)} of {formatValue(goal.target, goal.unit)}
                    </Text>
                  </VStack>
                </HStack>
                {getStatusBadge(goal)}
              </HStack>

              <Box>
                {/* Custom progress bar for Chakra UI v3 */}
                <Box
                  bg="muted.100"
                  borderRadius="md"
                  overflow="hidden"
                  height="8px"
                >
                  <Box
                    bg={`${getProgressColor(percentage)}.500`}
                    height="100%"
                    width={`${percentage}%`}
                    transition="width 0.3s ease"
                    borderRadius={percentage === 100 ? "md" : "0"}
                  />
                </Box>
                <HStack justify="space-between" mt={2}>
                  <Text fontSize="sm" color="text.muted">
                    {percentage.toFixed(1)}% complete
                  </Text>
                  {goal.deadline && (
                    <Text fontSize="sm" color="text.muted">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </Text>
                  )}
                </HStack>
              </Box>

              {isCompleted && (
                <HStack gap={2} color="green.500">
                  <Icon as={Award} boxSize={16} />
                  <Text fontSize="sm" fontWeight="medium">
                    Goal achieved! 🎉
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>
        )
      })}
    </VStack>
  )
}

export default GoalProgressIndicator