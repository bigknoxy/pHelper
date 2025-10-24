import { useState, useMemo } from 'react'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  HStack,
  VStack,
  Spinner,
  Flex,
} from '@chakra-ui/react'
import { useExercises } from '../hooks/useExercises'
import { Exercise, ExerciseCategory, MuscleGroup, ExerciseDifficulty } from '../api/exercises'
import Card from './shared/Card'
import Button from './shared/Button'
import MvpTabs from './MvpTabs'

interface ExerciseLibraryProps {
  onSelectExercise?: (exercise: Exercise) => void
  selectedExercises?: string[]
  multiSelect?: boolean
}

export default function ExerciseLibrary({
  onSelectExercise,
  selectedExercises = [],
  multiSelect = false
}: ExerciseLibraryProps) {
  const [searchTerm] = useState('')
  const [selectedCategory] = useState<ExerciseCategory | ''>('')
  const [selectedMuscleGroups] = useState<MuscleGroup[]>([])
  const [selectedDifficulty] = useState<ExerciseDifficulty | ''>('')

  // Fetch data
  const { exercises, isLoading, error } = useExercises({
    search: searchTerm,
    category: selectedCategory || undefined,
    muscleGroup: selectedMuscleGroups.length > 0 ? selectedMuscleGroups[0] : undefined,
    difficulty: selectedDifficulty || undefined,
    limit: 100,
  })



  // Filter exercises based on selected muscle groups
  const filteredExercises = useMemo(() => {
    if (selectedMuscleGroups.length === 0) return exercises

    return exercises.filter(exercise =>
      selectedMuscleGroups.some(group => exercise.muscleGroups.includes(group))
    )
  }, [exercises, selectedMuscleGroups])

  // Group exercises by category for tabbed view
  const exercisesByCategory = useMemo(() => {
    const grouped: Record<string, Exercise[]> = {}

    filteredExercises.forEach(exercise => {
      if (!grouped[exercise.category]) {
        grouped[exercise.category] = []
      }
      grouped[exercise.category].push(exercise)
    })

    return grouped
  }, [filteredExercises])

  const handleExerciseSelect = (exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise)
    }
  }



  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
        <Text color="red.600">Failed to load exercises. Please try again.</Text>
      </Box>
    )
  }

  // Create tabs for categories
  const categoryTabs = Object.keys(exercisesByCategory).map(category => ({
    label: `${category.charAt(0) + category.slice(1).toLowerCase()} (${exercisesByCategory[category].length})`,
    value: category,
    content: (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {exercisesByCategory[category].map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            isSelected={selectedExercises.includes(exercise.id)}
            onSelect={() => handleExerciseSelect(exercise)}
            showSelectButton={!!onSelectExercise}
          />
        ))}
      </SimpleGrid>
    )
  }))

  return (
    <Box>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Exercise Library</Heading>
          <Text color="gray.600">
            Browse and search through our comprehensive exercise database
          </Text>
        </Box>

        {/* Search and Filters */}
        <Card>
            <VStack gap={4} align="stretch" p={6}>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="medium">
                  {filteredExercises.length} Exercises
                </Text>
                {multiSelect && selectedExercises.length > 0 && (
                  <Text fontSize="sm" color="gray.600">
                    {selectedExercises.length} selected
                  </Text>
                )}
              </HStack>

              {filteredExercises.length === 0 ? (
                <Text textAlign="center" py={8} color="gray.500">
                  No exercises found matching your criteria.
                </Text>
              ) : (
                <MvpTabs tabs={categoryTabs} />
              )}
            </VStack>
          </Card>

        {/* Results */}
        {isLoading ? (
          <Flex justify="center" py={8}>
            <Spinner size="lg" color="teal.500" />
          </Flex>
        ) : (
          <Card>
            <VStack gap={4} align="stretch" p={6}>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="medium">
                  {filteredExercises.length} Exercises
                </Text>
                {multiSelect && selectedExercises.length > 0 && (
                  <Text fontSize="sm" color="gray.600">
                    {selectedExercises.length} selected
                  </Text>
                )}
              </HStack>

              {filteredExercises.length === 0 ? (
                <Text textAlign="center" py={8} color="gray.500">
                  No exercises found matching your criteria.
                </Text>
              ) : (
                <MvpTabs tabs={categoryTabs} />
              )}
            </VStack>
          </Card>
        )}
      </VStack>
    </Box>
  )
}

interface ExerciseCardProps {
  exercise: Exercise
  isSelected?: boolean
  onSelect?: () => void
  showSelectButton?: boolean
}

function ExerciseCard({ exercise, isSelected, onSelect, showSelectButton }: ExerciseCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'green'
      case 'INTERMEDIATE': return 'yellow'
      case 'ADVANCED': return 'red'
      default: return 'gray'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'STRENGTH': return 'blue'
      case 'CARDIO': return 'red'
      case 'FLEXIBILITY': return 'purple'
      case 'BALANCE': return 'orange'
      case 'FUNCTIONAL': return 'teal'
      case 'SPORTS': return 'pink'
      default: return 'gray'
    }
  }

  return (
    <Card
      borderColor={isSelected ? 'teal.500' : 'transparent'}
      borderWidth={isSelected ? 2 : 1}
      _hover={{ shadow: 'md' }}
      cursor={showSelectButton ? 'pointer' : 'default'}
      onClick={showSelectButton ? onSelect : undefined}
    >
      <VStack gap={3} align="stretch" p={4}>
        <HStack justify="space-between" align="start">
          <Heading size="md" flex={1}>
            {exercise.name}
          </Heading>
          {showSelectButton && (
            <Button
              size="sm"
              colorScheme={isSelected ? 'gray' : 'teal'}
              variant={isSelected ? 'outline' : 'solid'}
              onClick={(e) => {
                e.stopPropagation()
                onSelect?.()
              }}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          )}
        </HStack>

        <HStack gap={2}>
          <Badge colorScheme={getCategoryColor(exercise.category)} size="sm">
            {exercise.category}
          </Badge>
          <Badge colorScheme={getDifficultyColor(exercise.difficulty)} size="sm">
            {exercise.difficulty}
          </Badge>
        </HStack>

        {exercise.description && (
          <Text fontSize="sm" color="gray.600">
            {exercise.description}
          </Text>
        )}

        {exercise.muscleGroups.length > 0 && (
          <Box>
            <Text fontSize="xs" fontWeight="medium" mb={1}>
              Target Muscles:
            </Text>
            <HStack gap={1} wrap="wrap">
              {exercise.muscleGroups.slice(0, 3).map(group => (
                <Badge key={group} size="xs" colorScheme="gray">
                  {group}
                </Badge>
              ))}
              {exercise.muscleGroups.length > 3 && (
                <Badge size="xs" colorScheme="gray">
                  +{exercise.muscleGroups.length - 3} more
                </Badge>
              )}
            </HStack>
          </Box>
        )}

         {exercise.equipment && exercise.equipment.length > 0 && (
           <Box>
             <Text fontSize="xs" fontWeight="medium" mb={1}>
               Equipment:
             </Text>
             <HStack gap={1} wrap="wrap">
               {exercise.equipment.slice(0, 2).map(equipment => (
                 <Badge key={equipment} size="xs" colorScheme="blue">
                   {equipment}
                 </Badge>
               ))}
               {exercise.equipment.length > 2 && (
                 <Badge size="xs" colorScheme="blue">
                   +{exercise.equipment.length - 2} more
                 </Badge>
               )}
             </HStack>
           </Box>
         )}
      </VStack>
    </Card>
  )
}