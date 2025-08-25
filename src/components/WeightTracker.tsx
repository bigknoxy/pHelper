import { useState, useEffect } from 'react';
import { Box, Button, Heading, Text, Stack } from '@chakra-ui/react';
import { Input, List } from '@chakra-ui/react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface WeightEntry {
  date: string;
  weight: number;
}

const LOCAL_STORAGE_KEY = 'weightEntries';

export default function WeightTracker() {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  // Auto-select today's date in YYYY-MM-DD format
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setWeightEntries(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(weightEntries));
  }, [weightEntries]);

  const handleAddEntry = () => {
    if (!date || !weight) return;
    setWeightEntries([
      ...weightEntries,
      { date, weight: parseFloat(weight) },
    ]);
    setDate('');
    setWeight('');
  };

  return (
    <Box>
      <Heading size="md" mb={4}>Log Your Weight</Heading>
      <Stack gap={4} align="stretch">
        <label>Date
          <Input type="date" value={date} aria-label="date" onChange={e => setDate(e.target.value)} />
        </label>
        <label>Weight (lb)
          <Input type="number" value={weight} aria-label="weight" onChange={e => setWeight(e.target.value)} />
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
          Add Entry
        </Button>
      </Stack>
      {weightEntries.length > 0 && (
        <Box mt={8}>
          <Heading size="sm" mb={2}>History</Heading>
          <List.Root gap="2">
            {weightEntries.map((entry, idx) => (
              <List.Item key={idx}>
                <Text>{entry.date}: {entry.weight} lb</Text>
              </List.Item>
            ))}
          </List.Root>
          <Heading size="sm" mb={2}>Trend</Heading>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightEntries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#3182ce" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}
