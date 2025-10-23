import React, { useState } from 'react'
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
} from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createWeightGoal } from '../../api/weightGoals'

interface Milestone {
  weight: number
  date: string
}

interface WeightGoalForm {
  goalWeight: number
  targetDate: string
  milestones: Milestone[]
}

const WeightGoalWizard: React.FC = () => {
  const [formData, setFormData] = useState<WeightGoalForm>({
    goalWeight: 0,
    targetDate: '',
    milestones: []
  })
  const queryClient = useQueryClient()

  const createGoalMutation = useMutation({
    mutationFn: (data: { goalWeight: number; targetDate: string; milestones?: { milestoneWeight: number; targetDate: string }[] }) => createWeightGoal(data),
    onSuccess: () => {
      alert('Goal created successfully!')
      queryClient.invalidateQueries({ queryKey: ['weightGoals'] })
      resetForm()
    },
    onError: (error: Error) => {
      alert('Error creating goal: ' + error.message)
    },
  })

  const resetForm = () => {
    setFormData({ goalWeight: 0, targetDate: '', milestones: [] })
  }

  const handleSubmit = () => {
    const data = {
      goalWeight: formData.goalWeight,
      targetDate: formData.targetDate,
      milestones: formData.milestones.map(m => ({ milestoneWeight: m.weight, targetDate: m.date }))
    }
    createGoalMutation.mutate(data)
  }

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { weight: 0, date: '' }]
    })
  }

  const updateMilestone = (index: number, field: keyof Milestone, value: string | number) => {
    const updatedMilestones = formData.milestones.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    )
    setFormData({ ...formData, milestones: updatedMilestones })
  }

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index)
    })
  }

  return (
    <Box p={4} borderWidth={1} borderRadius="md">
      <Text fontSize="lg" mb={4}>Set Your Weight Goal</Text>
      <VStack gap={4} align="stretch">
        <Box>
          <Text mb={2}>Goal Weight (lbs)</Text>
          <Input
            type="number"
            value={formData.goalWeight}
            onChange={(e) => setFormData({ ...formData, goalWeight: parseFloat(e.target.value) || 0 })}
          />
        </Box>
        <Box>
          <Text mb={2}>Target Date</Text>
          <Input
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
          />
        </Box>
        <Box>
          <Text mb={2}>Milestones (Optional)</Text>
          {formData.milestones.map((milestone, index) => (
            <HStack key={index} gap={2} mb={2}>
              <Input
                type="number"
                placeholder="Weight"
                value={milestone.weight}
                onChange={(e) => updateMilestone(index, 'weight', parseFloat(e.target.value) || 0)}
              />
              <Input
                type="date"
                placeholder="Date"
                value={milestone.date}
                onChange={(e) => updateMilestone(index, 'date', e.target.value)}
              />
              <Button onClick={() => removeMilestone(index)} colorScheme="red" size="sm">
                Remove
              </Button>
            </HStack>
          ))}
          <Button onClick={addMilestone} variant="outline">
            Add Milestone
          </Button>
        </Box>
        <Button
          colorScheme="teal"
          onClick={handleSubmit}
          disabled={formData.goalWeight <= 0 || !formData.targetDate}
          loading={createGoalMutation.isPending}
        >
          Create Goal
        </Button>
      </VStack>
    </Box>
  )
}

export default WeightGoalWizard