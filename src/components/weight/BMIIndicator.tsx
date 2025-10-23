import React, { useState } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Input,
  Button,
} from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { calculateBMI } from '../../api/bmi'

const BMIIndicator: React.FC = () => {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [bmi, setBmi] = useState<number | null>(null)
  const [category, setCategory] = useState('')

  const calculateBMIMutation = useMutation({
    mutationFn: (data: { weight: number; height: number }) => calculateBMI(data.weight, data.height),
    onSuccess: (data) => {
      setBmi(data.bmi)
      setCategory(data.category)
    },
    onError: (error: Error) => {
      alert('Error calculating BMI: ' + error.message)
    },
  })

  const handleCalculate = () => {
    if (!weight || !height) return
    calculateBMIMutation.mutate({ weight: parseFloat(weight), height: parseFloat(height) })
  }

  return (
    <Box p={4} borderWidth={1} borderRadius="md">
      <VStack gap={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">BMI Calculator</Text>
        <HStack gap={2}>
          <Input
            type="number"
            placeholder="Weight (lbs)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Height (inches)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <Button onClick={handleCalculate} colorScheme="teal" loading={calculateBMIMutation.isPending}>
            Calculate
          </Button>
        </HStack>
        {bmi && (
          <Box>
            <Text>Your BMI: {bmi}</Text>
            <Text>Category: {category}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}

export default BMIIndicator