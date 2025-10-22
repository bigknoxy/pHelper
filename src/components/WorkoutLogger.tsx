import { useState } from 'react';
import { Box, Heading, Text, Stack, Input } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { WorkoutEntry } from '../api/workouts';
import Button from './shared/Button';
import { useWorkouts } from '../hooks/useWorkouts';

export default function WorkoutLogger() {
  const { token } = useAuth();
  const { workouts = [], addWorkout, isAdding } = useWorkouts(Boolean(token));
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  // keep local state only for form inputs; data comes from the hook

  const handleAddEntry = async () => {
    if (!date || !type || !duration) return;
    try {
      await addWorkout({ type, duration: parseInt(duration, 10), date, notes });
      setDate(today);
      setType('');
      setDuration('');
      setNotes('');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to add workout', err);
    }
  };

  return (
    <Box>
      {!token ? (
        <Text color="red.400">Please log in to use the Workout Logger.</Text>
      ) : (
        <>
          <Heading size="md" mb={4}>Log Your Workout</Heading>
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
          {workouts.length > 0 && (
            <Box mt={8}>
              <Heading size="sm" mb={2}>History</Heading>
              <Stack gap={2}>
                {workouts.map((entry: WorkoutEntry, idx: number) => (
                  <Box key={entry.id || idx}>
                    <Text>{entry.date}: {entry.type}, {entry.duration} min, {entry.notes}</Text>
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
