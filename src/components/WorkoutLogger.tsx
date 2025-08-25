import { useState, useEffect } from 'react';
import { Box, Button, Heading, Text, Stack } from '@chakra-ui/react';
import { Input, List } from '@chakra-ui/react';

interface WorkoutEntry {
  date: string;
  type: string;
  duration: number;
  notes: string;
}

const LOCAL_STORAGE_KEY = 'workoutEntries';

export default function WorkoutLogger() {
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  // Auto-select today's date in YYYY-MM-DD format
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setWorkoutEntries(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workoutEntries));
  }, [workoutEntries]);

  const handleAddEntry = () => {
    if (!date || !type || !duration) return;
    setWorkoutEntries([
      ...workoutEntries,
      { date, type, duration: parseInt(duration), notes },
    ]);
    setDate('');
    setType('');
    setDuration('');
    setNotes('');
  };

  return (
    <Box>
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
        >
          Add Workout
        </Button>
      </Stack>
      {workoutEntries.length > 0 && (
        <Box mt={8}>
          <Heading size="sm" mb={2}>History</Heading>
          <List.Root gap="2">
            {workoutEntries.map((entry, idx) => (
              <List.Item key={idx}>
                <Text>{entry.date}: {entry.type}, {entry.duration} min, {entry.notes}</Text>
              </List.Item>
            ))}
          </List.Root>
        </Box>
      )}
    </Box>
  );
}
