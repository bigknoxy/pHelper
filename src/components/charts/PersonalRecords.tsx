import React from 'react'
import { Box, Text, VStack, HStack, Badge, Icon, SimpleGrid } from '@chakra-ui/react'
import { Trophy, TrendingUp, Target, Award, Calendar } from 'lucide-react'

interface PersonalRecord {
  id: string
  type: 'weight' | 'workout' | 'task'
  title: string
  value: number | string
  unit: string
  date: string
  description?: string
  isNew?: boolean
}

interface PersonalRecordsProps {
  records: PersonalRecord[]
  title?: string
  maxRecords?: number
}

const PersonalRecords: React.FC<PersonalRecordsProps> = ({
  records,
  title = "Personal Records",
  maxRecords = 6
}) => {
  const displayRecords = records.slice(0, maxRecords)

  if (displayRecords.length === 0) {
    return (
      <Box
        p={6}
        textAlign="center"
        bg="surface.50"
        borderRadius="md"
        border="1px solid"
        borderColor="muted.200"
      >
        <Icon as={Trophy} boxSize={48} color="muted.400" mb={3} />
        <Text color="text.secondary" fontSize="lg">
          No records yet
        </Text>
        <Text color="text.muted" fontSize="sm">
          Keep tracking to set new personal records!
        </Text>
      </Box>
    )
  }

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return Target
      case 'workout':
        return TrendingUp
      case 'task':
        return Award
      default:
        return Trophy
    }
  }

  const getRecordColor = (type: string) => {
    switch (type) {
      case 'weight':
        return 'blue'
      case 'workout':
        return 'green'
      case 'task':
        return 'purple'
      default:
        return 'yellow'
    }
  }

  const formatValue = (value: number | string, unit: string) => {
    if (typeof value === 'number' && unit === 'minutes') {
      return `${value} min`
    }
    if (typeof value === 'number' && unit === 'count') {
      return value.toLocaleString()
    }
    return `${value} ${unit}`
  }

  return (
    <Box>
      <HStack mb={4} align="center">
        <Icon as={Trophy} color="primary.500" />
        <Text fontSize="lg" fontWeight="semibold" color="text.primary">
          {title}
        </Text>
      </HStack>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
        {displayRecords.map((record) => (
          <Box
            key={record.id}
            p={4}
            bg="surface.50"
            borderRadius="md"
            border="1px solid"
            borderColor="muted.200"
            position="relative"
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
          >
            {record.isNew && (
              <Badge
                position="absolute"
                top={2}
                right={2}
                colorScheme="green"
                size="sm"
                fontSize="xs"
              >
                NEW!
              </Badge>
            )}

            <VStack gap={2} align="stretch">
              <HStack gap={2}>
                <Icon
                  as={getRecordIcon(record.type)}
                  color={`${getRecordColor(record.type)}.500`}
                  boxSize={20}
                />
                <VStack gap={0} align="flex-start" flex={1}>
                  <Text fontSize="sm" fontWeight="medium" color="text.primary">
                    {record.title}
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="text.primary">
                    {formatValue(record.value, record.unit)}
                  </Text>
                </VStack>
              </HStack>

              <HStack gap={2} align="center">
                <Icon as={Calendar} boxSize={14} color="muted.400" />
                <Text fontSize="xs" color="text.muted">
                  {new Date(record.date).toLocaleDateString()}
                </Text>
              </HStack>

              {record.description && (
                <Text fontSize="xs" color="text.secondary" lineHeight="1.4">
                  {record.description}
                </Text>
              )}
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      {records.length > maxRecords && (
        <Text fontSize="sm" color="text.muted" textAlign="center" mt={4}>
          And {records.length - maxRecords} more records...
        </Text>
      )}
    </Box>
  )
}

export default PersonalRecords