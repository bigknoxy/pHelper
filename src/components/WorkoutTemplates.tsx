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
import { useWorkoutTemplates, useWorkoutTemplateCategories } from '../hooks/useWorkoutTemplates'
import { WorkoutTemplate } from '../api/workoutTemplates'
import Card from './shared/Card'

interface WorkoutTemplatesProps {
  onSelectTemplate?: (template: WorkoutTemplate) => void
  onCreateWorkout?: (template: WorkoutTemplate) => void
}

export default function WorkoutTemplates({
  onSelectTemplate,
  onCreateWorkout
}: WorkoutTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showPublicOnly, setShowPublicOnly] = useState(false)

  // Fetch data
  const { templates, isLoading, error } = useWorkoutTemplates({
    search: searchTerm,
    category: selectedCategory,
    isPublic: showPublicOnly,
    limit: 50,
  })

  const { data: categories = [] } = useWorkoutTemplateCategories()

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = !searchTerm ||
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = !selectedCategory || template.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [templates, searchTerm, selectedCategory])

  // Group templates by category for display
  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, WorkoutTemplate[]> = {}

    filteredTemplates.forEach(template => {
      if (!grouped[template.category]) {
        grouped[template.category] = []
      }
      grouped[template.category].push(template)
    })

    return grouped
  }, [filteredTemplates])

  const handleTemplateSelect = (template: WorkoutTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template)
    }
  }

  const handleCreateWorkout = (template: WorkoutTemplate) => {
    if (onCreateWorkout) {
      onCreateWorkout(template)
    }
  }

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
        <Text color="red.600">Failed to load workout templates. Please try again.</Text>
      </Box>
    )
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Workout Templates</Heading>
          <Text color="gray.600">
            Browse and manage workout templates to quickly start your workouts
          </Text>
        </Box>

        {/* Controls */}
        <Card>
          <VStack gap={4} align="stretch" p={6}>
            <HStack gap={4}>
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                flex={1}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #4A5568',
                  backgroundColor: '#2D3748',
                  color: 'white'
                }}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0) + category.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant={showPublicOnly ? 'solid' : 'outline'}
                colorScheme={showPublicOnly ? 'teal' : 'gray'}
                onClick={() => setShowPublicOnly(!showPublicOnly)}
              >
                {showPublicOnly ? 'Public Only' : 'All Templates'}
              </Button>
            </HStack>
          </VStack>
        </Card>

        {/* Results */}
        {isLoading ? (
          <Flex justify="center" py={8}>
            <Text>Loading templates...</Text>
          </Flex>
        ) : filteredTemplates.length === 0 ? (
          <Card>
            <Text textAlign="center" py={8} color="gray.500">
              No templates found matching your criteria.
            </Text>
          </Card>
        ) : (
          <VStack gap={6} align="stretch">
            {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
              <Card key={category}>
                <VStack gap={4} align="stretch" p={6}>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="medium">
                      {category.charAt(0) + category.slice(1).toLowerCase()} ({categoryTemplates.length})
                    </Text>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                    {categoryTemplates.map(template => (
                      <WorkoutTemplateCard
                        key={template.id}
                        template={template}
                        onSelect={() => handleTemplateSelect(template)}
                        onCreateWorkout={() => handleCreateWorkout(template)}
                      />
                    ))}
                  </SimpleGrid>
                </VStack>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  )
}

interface WorkoutTemplateCardProps {
  template: WorkoutTemplate
  onSelect: () => void
  onCreateWorkout: () => void
}

function WorkoutTemplateCard({ template, onSelect, onCreateWorkout }: WorkoutTemplateCardProps) {
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
    <Card>
      <VStack gap={3} align="stretch" p={4}>
        <HStack justify="space-between">
          <Heading size="md" flex={1}>
            {template.name}
          </Heading>
          {template.isPublic && (
            <Badge colorScheme="green" size="sm">
              Public
            </Badge>
          )}
        </HStack>

        <Badge colorScheme={getCategoryColor(template.category)} size="sm">
          {template.category}
        </Badge>

        {template.description && (
          <Text fontSize="sm" color="gray.600">
            {template.description}
          </Text>
        )}

        <VStack gap={2} align="stretch">
          <Text fontSize="xs" fontWeight="medium">
            Exercises ({template.exercises.length}):
          </Text>
          <VStack gap={1} align="stretch">
            {template.exercises.slice(0, 3).map(exercise => (
              <HStack key={exercise.id} justify="space-between">
                <Text fontSize="xs" color="gray.600">
                  {exercise.exercise.name}
                </Text>
                <HStack gap={1}>
                  <Badge size="xs" colorScheme="gray">
                    {exercise.sets} sets
                  </Badge>
                  {exercise.reps && (
                    <Badge size="xs" colorScheme="gray">
                      {exercise.reps} reps
                    </Badge>
                  )}
                </HStack>
              </HStack>
            ))}
            {template.exercises.length > 3 && (
              <Text fontSize="xs" color="gray.500">
                +{template.exercises.length - 3} more exercises
              </Text>
            )}
          </VStack>

          <HStack gap={2}>
            <Button
              size="sm"
              colorScheme="teal"
              variant="outline"
              onClick={onSelect}
              flex={1}
            >
              View Details
            </Button>
            <Button
              size="sm"
              colorScheme="teal"
              onClick={onCreateWorkout}
              flex={1}
            >
              Start Workout
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </Card>
  )
}