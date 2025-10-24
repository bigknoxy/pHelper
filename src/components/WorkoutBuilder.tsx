import { useState, useMemo } from 'react'
import {
  Box,
  Heading,
  Text,
  Input,
  SimpleGrid,
  Badge,
  HStack,
  VStack,
  Button,
  Flex,
} from '@chakra-ui/react'
import { useExercises } from '../hooks/useExercises'
import { Exercise, ExerciseCategory } from '../api/exercises'
import Card from './shared/Card'

interface WorkoutExercise {
  id: string
  exerciseId: string
  exercise: Exercise
  sets: number
  reps?: number
  weight?: number
  duration?: number // in seconds
  restTime?: number // in seconds
  order: number
  notes?: string
  distance?: number // in kilometers
  calories?: number // estimated calories
}

interface WorkoutBuilderProps {
  onSave?: (workout: {
    name: string
    exercises: Omit<WorkoutExercise, 'id' | 'exercise'>[]
  }) => void
  initialExercises?: WorkoutExercise[]
}

export default function WorkoutBuilder({
  onSave,
  initialExercises = []
}: WorkoutBuilderProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | ''>('')
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    initialExercises.length > 0 ? initialExercises : []
  )
  const [workoutName, setWorkoutName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Fetch exercises for the library
  const { exercises, isLoading, error } = useExercises({
    search: searchTerm,
    category: selectedCategory || undefined,
    limit: 50,
  })

  // Filter out exercises already in the workout
  const availableExercises = useMemo(() => {
    const workoutExerciseIds = workoutExercises.map(we => we.exerciseId)
    return exercises.filter(exercise => !workoutExerciseIds.includes(exercise.id))
  }, [exercises, workoutExercises])

  const handleAddExercise = (exercise: Exercise) => {
    const isCardio = exercise.category === 'CARDIO'
    const newWorkoutExercise: WorkoutExercise = {
      id: `temp-${Date.now()}`,
      exerciseId: exercise.id,
      exercise,
      sets: 1,
      order: workoutExercises.length,
      notes: '',
      ...(isCardio ? {} : { reps: 10, weight: 0 }) // Default reps and weight for strength exercises
    }

    setWorkoutExercises(prev => [...prev, newWorkoutExercise])
  }

  const handleRemoveExercise = (exerciseId: string) => {
    setWorkoutExercises(prev =>
      prev.filter(we => we.exerciseId !== exerciseId)
        .map((we, index) => ({ ...we, order: index }))
    )
  }

  const handleExerciseUpdate = (exerciseId: string, updates: Partial<WorkoutExercise>) => {
    setWorkoutExercises(prev =>
      prev.map(we =>
        we.exerciseId === exerciseId ? { ...we, ...updates } : we
      )
    )
  }

  const handleSave = async () => {
    if (!workoutName.trim() || workoutExercises.length === 0) {
      return
    }

    setIsSaving(true)
    try {
      const workoutData = {
        name: workoutName.trim(),
        exercises: workoutExercises.map(({ id, exercise, ...we }) => we)
      }

      if (onSave) {
        onSave(workoutData)
      }

      // Reset form
      setWorkoutName('')
      setWorkoutExercises([])
    } catch (error) {
      console.error('Failed to save workout:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
        <Text color="red.600">Failed to load exercises. Please try again.</Text>
      </Box>
    )
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Workout Builder</Heading>
          <Text color="gray.600">
            Create a custom workout by selecting exercises and setting parameters
          </Text>
        </Box>

        {/* Workout Name */}
        <Card>
          <VStack gap={4} align="stretch" p={6}>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Workout Name</Text>
              <Input
                placeholder="e.g., Upper Body Strength"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
            </Box>
          </VStack>
        </Card>

        <Flex gap={6}>
          {/* Exercise Library */}
          <Box flex={1}>
            <Card>
              <VStack gap={4} align="stretch" p={6}>
                <HStack>
                  <Input
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    flex={1}
                  />
                   <select
                     value={selectedCategory}
                     onChange={(e) => setSelectedCategory(e.target.value as ExerciseCategory | '')}
                     style={{
                       padding: '8px',
                       borderRadius: '6px',
                       border: '1px solid #4A5568',
                       backgroundColor: '#2D3748',
                       color: 'white'
                     }}
                   >
                     <option value="">All Categories</option>
                     <option value="STRENGTH">Strength</option>
                     <option value="CARDIO">Cardio</option>
                     <option value="FLEXIBILITY">Flexibility</option>
                     <option value="BALANCE">Balance</option>
                     <option value="FUNCTIONAL">Functional</option>
                     <option value="SPORTS">Sports</option>
                   </select>
                </HStack>

                {isLoading ? (
                  <Flex justify="center" py={8}>
                    <Text>Loading exercises...</Text>
                  </Flex>
                ) : availableExercises.length === 0 ? (
                  <Text textAlign="center" py={8} color="gray.500">
                    No exercises available.
                  </Text>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                    {availableExercises.map(exercise => (
                      <Card key={exercise.id}>
                        <VStack gap={2} align="stretch" p={4}>
                          <HStack justify="space-between">
                            <Text fontSize="sm" fontWeight="medium">
                              {exercise.name}
                            </Text>
                            <Button
                              size="xs"
                              colorScheme="teal"
                              onClick={() => handleAddExercise(exercise)}
                            >
                              Add
                            </Button>
                          </HStack>
                          <HStack gap={1}>
                            <Badge size="xs" colorScheme="blue">
                              {exercise.category}
                            </Badge>
                            <Badge size="xs" colorScheme="green">
                              {exercise.difficulty}
                            </Badge>
                          </HStack>
                        </VStack>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </VStack>
            </Card>
          </Box>

          {/* Workout Exercises */}
          <Box flex={1}>
            <Card>
              <VStack gap={4} align="stretch" p={6}>
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="medium">
                    Workout Exercises ({workoutExercises.length})
                  </Text>
                  {workoutExercises.length > 0 && (
                    <Button
                      colorScheme="teal"
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Workout'}
                    </Button>
                  )}
                </HStack>

                {workoutExercises.length === 0 ? (
                  <Text textAlign="center" py={8} color="gray.500">
                    Add exercises from the library to build your workout.
                  </Text>
                ) : (
                  <VStack gap={3} align="stretch">
                     {workoutExercises.map((workoutExercise) => (
                       <WorkoutExerciseCard
                         key={workoutExercise.id}
                         workoutExercise={workoutExercise}
                         onUpdate={(updates) => handleExerciseUpdate(workoutExercise.exerciseId, updates)}
                         onRemove={() => handleRemoveExercise(workoutExercise.exerciseId)}
                       />
                     ))}
                  </VStack>
                )}
              </VStack>
            </Card>
          </Box>
        </Flex>
      </VStack>
    </Box>
  )
}

interface WorkoutExerciseCardProps {
  workoutExercise: WorkoutExercise
  onUpdate: (updates: Partial<WorkoutExercise>) => void
  onRemove: () => void
}

function WorkoutExerciseCard({
  workoutExercise,
  onUpdate,
  onRemove
}: WorkoutExerciseCardProps) {
  const { exercise, sets, reps, weight, duration, restTime, notes, distance, calories } = workoutExercise

  const isCardio = exercise.category === 'CARDIO'

  return (
    <Card data-testid={`workout-exercise-${workoutExercise.exerciseId}`}>
      <VStack gap={3} align="stretch" p={4}>
        <HStack justify="space-between" align="start">
          <VStack gap={1} align="start" flex={1}>
            <Text fontSize="sm" fontWeight="medium">
              {exercise.name}
            </Text>
            <HStack gap={1}>
              <Badge size="xs" colorScheme="blue">
                {exercise.category}
              </Badge>
              <Badge size="xs" colorScheme="green">
                {exercise.difficulty}
              </Badge>
            </HStack>
          </VStack>
           <Button
             size="xs"
             colorScheme="red"
             variant="outline"
             onClick={onRemove}
             data-testid={`remove-exercise-${workoutExercise.exerciseId}`}
           >
             Remove
           </Button>
        </HStack>

        {/* Exercise Parameters */}
        <VStack gap={3} align="stretch">
          {isCardio ? (
            // Cardio-specific inputs
            <>
              <HStack gap={3}>
                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="medium" mb={1}>Duration (sec)</Text>
                  <Input
                    aria-label="Duration (sec)"
                    type="number"
                    size="sm"
                    min={0}
                    value={duration || ''}
                    onChange={(e) => onUpdate({ duration: parseInt(e.target.value) || undefined })}
                    placeholder="Optional"
                  />
                </Box>

                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="medium" mb={1}>Distance (km)</Text>
                  <Input
                    aria-label="Distance (km)"
                    type="number"
                    size="sm"
                    min={0}
                    step={0.1}
                    value={distance || ''}
                    onChange={(e) => onUpdate({ distance: parseFloat(e.target.value) || undefined })}
                    placeholder="Optional"
                  />
                </Box>

                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="medium" mb={1}>Calories</Text>
                  <Input
                    aria-label="Calories"
                    type="number"
                    size="sm"
                    min={0}
                    value={calories || ''}
                    onChange={(e) => onUpdate({ calories: parseInt(e.target.value) || undefined })}
                    placeholder="Optional"
                  />
                </Box>
              </HStack>
            </>
          ) : (
            // Strength-specific inputs
            <>
              <HStack gap={3}>
                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="medium" mb={1}>Sets</Text>
                  <Input
                    aria-label="Sets"
                    type="number"
                    size="sm"
                    min={1}
                    max={20}
                    value={sets}
                    onChange={(e) => onUpdate({ sets: parseInt(e.target.value) || 1 })}
                  />
                </Box>

                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="medium" mb={1}>Reps</Text>
                  <Input
                    aria-label="Reps"
                    type="number"
                    size="sm"
                    min={1}
                    max={100}
                    value={reps || ''}
                    onChange={(e) => onUpdate({ reps: parseInt(e.target.value) || undefined })}
                    placeholder="Optional"
                  />
                </Box>

                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="medium" mb={1}>Weight (lbs)</Text>
                  <Input
                    aria-label="Weight (lbs)"
                    type="number"
                    size="sm"
                    min={0}
                    step={2.5}
                    value={weight || ''}
                    onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) || undefined })}
                    placeholder="Optional"
                  />
                </Box>
              </HStack>

              <HStack gap={3}>
                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="medium" mb={1}>Duration (sec)</Text>
                  <Input
                    aria-label="Duration (sec)"
                    type="number"
                    size="sm"
                    min={0}
                    value={duration || ''}
                    onChange={(e) => onUpdate({ duration: parseInt(e.target.value) || undefined })}
                    placeholder="Optional"
                  />
                </Box>

                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="medium" mb={1}>Rest (sec)</Text>
                  <Input
                    aria-label="Rest (sec)"
                    type="number"
                    size="sm"
                    min={0}
                    value={restTime || ''}
                    onChange={(e) => onUpdate({ restTime: parseInt(e.target.value) || undefined })}
                    placeholder="Optional"
                  />
                </Box>
              </HStack>
            </>
          )}

          <Box>
            <Text fontSize="xs" fontWeight="medium" mb={1}>Notes</Text>
            <Input
              size="sm"
              placeholder="Exercise notes..."
              value={notes || ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
            />
          </Box>
        </VStack>
      </VStack>
    </Card>
  )
}