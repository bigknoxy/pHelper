import { useState, useEffect } from 'react';
import { Box, Text, Stack } from '@chakra-ui/react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getWeights, addWeight, WeightEntry } from '../api/weights';
import FormInput from './shared/FormInput';
import Button from './shared/Button';
import WeightGoalWizard from './weight/WeightGoalWizard';
import GoalProgressTracker from './weight/GoalProgressTracker';
import BMIIndicator from './weight/BMIIndicator';

export default function WeightTracker() {
  const { token } = useAuth();
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getWeights()
      .then((data) => setWeightEntries(data))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAddEntry = async () => {
    if (!date || !weight) return;
    setLoading(true);
    try {
      const entry = await addWeight(parseFloat(weight), date);
      setWeightEntries([...weightEntries, entry]);
      setDate(today);
      setWeight('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {!token ? (
        <Text color="red.400">Please log in to use the Weight Tracker.</Text>
      ) : (
        <>
          <Box as="form" role="form" aria-labelledby="weight-form-heading"
            onSubmit={e => {
              e.preventDefault();
              handleAddEntry();
            }}
          >
            <Text id="weight-form-heading" fontSize="lg" fontWeight="bold" mb={4}>Log Your Weight</Text>
            <Stack gap={4} align="stretch">
              <FormInput
                label="Date"
                type="date"
                value={date}
                onChange={setDate}
                required
                aria-label="Weight entry date"
              />
              <FormInput
                label="Weight (lb)"
                type="number"
                value={weight}
                onChange={setWeight}
                placeholder="Enter your weight in pounds"
                required
                aria-label="Weight in pounds"
              />
              <Button
                type="submit"
                colorScheme="teal"
                variant="solid"
                size="md"
                loading={loading}
                aria-label="Add weight entry"
              >
                Add Entry
              </Button>
             </Stack>
           </Box>
<Box mt={8}>
              <WeightGoalWizard />
            </Box>
            <Box mt={8}>
              <GoalProgressTracker />
            </Box>
            <Box mt={8}>
              <BMIIndicator />
            </Box>
           {weightEntries.length > 0 && (
            <Box mt={8} role="region" aria-labelledby="weight-history-heading">
              <Text id="weight-history-heading" fontSize="lg" fontWeight="bold" mb={4}>Weight History</Text>
              <Stack gap={2} as="ul" listStyleType="none" mb={6}>
                {weightEntries.map((entry, idx) => (
                  <Box key={entry.id || idx} as="li" p={2} borderWidth="1px" borderRadius="md" borderColor="gray.600" bg="surface.800">
                    <Text>{new Date(entry.date).toLocaleDateString()}: {entry.weight} lb</Text>
                  </Box>
                ))}
              </Stack>
              <Text fontSize="lg" fontWeight="bold" mb={4}>Weight Trend</Text>
              <Box borderWidth="1px" borderRadius="md" borderColor="gray.600" p={4} bg="surface.800">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weightEntries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        color: '#F3F4F6'
                      }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#0bc5ea" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
