import { useState, useEffect } from 'react';
import { Box, Button, Heading, Text, Stack, Input } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { getWorkouts, addWorkout, WorkoutEntry } from '../api/workouts';

export default function WorkoutLogger() {
  const { token } = useAuth();
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const LOCAL_STORAGE_KEY = 'workoutEntries';

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getWorkouts()
      .then((data) => setWorkoutEntries(data))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAddEntry = async () => {
    if (!date || !type || !duration) return;
    setLoading(true);
    try {
      const entry = await addWorkout(type, parseInt(duration), date, notes);
      setWorkoutEntries(prev => [...prev, entry]);
      setDate(today);
      setType('');
      setDuration('');
      setNotes('');
    } finally {
      setLoading(false);
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
            <label>Date
              <Input type="date" aria-label="date" value={date} onChange={e => setDate(e.target.value)} />
            </label>
            <label>Type
              <Input aria-label="type" value={type} onChange={e => setType(e.target.value)} placeholder="e.g. Running" />
            </label>
            <label>Duration (min)
              <Input type="number" aria-label="duration" value={duration} onChange={e => setDuration(e.target.value)} />
            </label>
            <label>Notes
              <Input aria-label="notes" value={notes} onChange={e => setNotes(e.target.value)} />
            </label>
<Button
              colorScheme="teal"
              variant="solid"
              size="md"
              borderRadius="md"
              boxShadow="md"
              fontWeight="bold"
              _hover={{ bg: "teal.300", boxShadow: "lg", cursor: "pointer" }}
              loading={loading}
              aria-label="Add Workout"
              onClick={handleAddEntry}
            >
              Add Workout
            </Button>
          </Stack>
          {workoutEntries.length > 0 && (
            <Box mt={8}>
              <Heading size="sm" mb={2}>History</Heading>
              <Stack gap={2}>
                {workoutEntries.map((entry, idx) => (
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
