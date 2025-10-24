import { useState, useMemo } from 'react';
import { Box, Heading, Text, Stack, Input, HStack, Button as ChakraButton, VStack, SimpleGrid, Badge } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { WorkoutEntry } from '../api/workouts';
import Button from './shared/Button';
import { useWorkouts } from '../hooks/useWorkouts';
import { useWorkoutTemplates, useWorkoutTemplate } from '../hooks/useWorkoutTemplates';
import WorkoutBuilder from './WorkoutBuilder';

type WorkoutMode = 'simple' | 'structured'

export default function WorkoutLogger() {
  const { token } = useAuth();
  const { workouts = [], addWorkout, isAdding } = useWorkouts(Boolean(token));
  const { templates, isLoading: templatesLoading } = useWorkoutTemplates({}, Boolean(token));
  const [mode, setMode] = useState<WorkoutMode>('simple');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);

  const { data: selectedTemplate } = useWorkoutTemplate(selectedTemplateId || '', Boolean(selectedTemplateId));

  const initialWorkoutExercises = useMemo(() => {
    if (selectedTemplate) {
      return selectedTemplate.exercises.map((te, index) => ({
        id: `temp-${te.id}`,
        exerciseId: te.exerciseId,
        exercise: te.exercise,
        sets: te.sets,
        reps: te.reps,
        weight: te.weight,
        duration: te.duration,
        restTime: te.restTime,
        order: index,
        notes: te.notes,
      }));
    }
    return [];
  }, [selectedTemplate]);

  // Simple mode state
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddEntry = async () => {
    if (!date || !type || !duration) return;
    try {
      await addWorkout({ type, duration: parseInt(duration, 10), date, notes });
      setDate(today);
      setType('');
      setDuration('');
      setNotes('');
    } catch (err) {
       
      console.error('Failed to add workout', err);
    }
  };

  const handleStructuredWorkoutSave = async (workoutData: {
    name: string
    exercises: {
      exerciseId: string
      sets: number
      reps?: number
      weight?: number
      duration?: number
      restTime?: number
      order: number
      notes?: string
      distance?: number
      calories?: number
    }[]
  }) => {
    try {
      await addWorkout({
        type: workoutData.name,
        duration: 60, // TODO: Calculate actual duration from exercises
        date: today,
        notes: `${workoutData.exercises.length} exercises`,
        templateId: selectedTemplateId || undefined,
        exercises: workoutData.exercises
      });
      setMode('simple'); // Switch back to simple mode after saving
      setSelectedTemplateId(null);
      setShowTemplateSelection(false);
    } catch (err) {
      console.error('Failed to save structured workout', err);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowTemplateSelection(false);
  };

  const handleSkipTemplate = () => {
    setSelectedTemplateId(null);
    setShowTemplateSelection(false);
  };

  const handleStartStructured = () => {
    setShowTemplateSelection(true);
  };

  return (
    <Box>
      {!token ? (
        <Text color="red.400">Please log in to use the Workout Logger.</Text>
      ) : (
        <>
          <Heading size="md" mb={4}>Log Your Workout</Heading>

          {/* Mode Toggle */}
          <HStack mb={6} gap={2}>
            <ChakraButton
              size="sm"
              colorScheme={mode === 'simple' ? 'teal' : 'gray'}
              variant={mode === 'simple' ? 'solid' : 'outline'}
              onClick={() => setMode('simple')}
            >
              Simple
            </ChakraButton>
             <ChakraButton
               size="sm"
               colorScheme={mode === 'structured' ? 'teal' : 'gray'}
               variant={mode === 'structured' ? 'solid' : 'outline'}
               onClick={() => {
                 setMode('structured');
                 handleStartStructured();
               }}
             >
               Structured
             </ChakraButton>
          </HStack>

          {mode === 'simple' ? (
            /* Simple Workout Logging */
            <Stack gap={4} align="stretch">
              <label htmlFor="workout-date">Date
                <Input id="workout-date" name="date" type="date" aria-label="date" value={date} onChange={e => setDate(e.target.value)} />
              </label>
              <label htmlFor="workout-type">Type
                <Input id="workout-type" name="type" aria-label="type" value={type} onChange={e => setType(e.target.value)} placeholder="e.g. Running" />
              </label>
              <label htmlFor="workout-duration">Duration (min)
                <Input id="workout-duration" name="duration" type="number" aria-label="duration" value={duration} onChange={e => setDuration(e.target.value)} />
              </label>
              <label htmlFor="workout-notes">Notes
                <Input id="workout-notes" name="notes" aria-label="notes" value={notes} onChange={e => setNotes(e.target.value)} />
              </label>
              <Button
                colorScheme="teal"
                variant="solid"
                size="md"
                borderRadius="md"
                boxShadow="md"
                fontWeight="bold"
                _hover={{ bg: "teal.300", boxShadow: "lg", cursor: "pointer" }}
                loading={isAdding}
                aria-label="Add Workout"
                onClick={handleAddEntry}
              >
                Add Workout
              </Button>
            </Stack>
           ) : (
             /* Structured Workout Logging */
             <>
               {showTemplateSelection ? (
                 <VStack gap={4} align="stretch">
                   <Heading size="md">Select a Template (Optional)</Heading>
                   {templatesLoading ? (
                     <Text>Loading templates...</Text>
                   ) : templates.length === 0 ? (
                     <Text>No templates available. Create one first or skip to build from scratch.</Text>
                   ) : (
                     <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                       {templates.map((template) => (
                         <Box key={template.id} p={4} borderWidth={1} borderRadius="md" borderColor="gray.200">
                           <VStack gap={2} align="stretch">
                             <Text fontWeight="bold">{template.name}</Text>
                             <Text fontSize="sm" color="gray.600">{template.description}</Text>
                             <Badge colorScheme="blue">{template.category}</Badge>
                             <HStack>
                               <Button size="sm" colorScheme="teal" onClick={() => handleSelectTemplate(template.id)}>
                                 Use Template
                               </Button>
                             </HStack>
                           </VStack>
                         </Box>
                       ))}
                     </SimpleGrid>
                   )}
                   <HStack>
                     <Button onClick={handleSkipTemplate}>Skip and Build from Scratch</Button>
                   </HStack>
                 </VStack>
               ) : (
                 <WorkoutBuilder onSave={handleStructuredWorkoutSave} initialExercises={initialWorkoutExercises} />
               )}
             </>
           )}

          {/* Workout History */}
          {workouts.length > 0 && (
            <Box mt={8}>
              <Heading size="sm" mb={2}>Recent Workouts</Heading>
              <Stack gap={2}>
                {workouts.slice(0, 10).map((entry: WorkoutEntry, idx: number) => (
                  <Box key={entry.id || idx} p={3} borderWidth={1} borderRadius="md" borderColor="gray.200">
                    <Text>
                      <strong>{new Date(entry.date).toLocaleDateString()}</strong>: {entry.type}, {entry.duration} min
                      {entry.notes && ` - ${entry.notes}`}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
