import { Box, SimpleGrid, Text, useBreakpointValue } from "@chakra-ui/react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function getWeightMetrics() {
  const entries: { date: string; weight: number }[] = JSON.parse(localStorage.getItem("weightEntries") || "[]");
  const latest = entries.length ? entries[entries.length - 1].weight : "-";
  const last7 = entries.slice(-7);
  const trend = last7.length > 1 ? (last7[last7.length - 1].weight - last7[0].weight) : 0;
  return { latest, trend, chart: last7 };
}

function getWorkoutMetrics() {
  const entries: { date: string; type: string; duration: number; notes: string }[] = JSON.parse(localStorage.getItem("workoutEntries") || "[]");
  const total = entries.length;
  const last = total ? entries[total - 1].date : "-";
  const types = entries.map((e: { type: string }) => e.type);
  const freqType = types.length ? types.sort((a: string, b: string) => types.filter((t: string) => t === a).length - types.filter((t: string) => t === b).length).pop() : "-";
  return { total, last, freqType };
}

function getTaskMetrics() {
  const entries: { completed: boolean }[] = JSON.parse(localStorage.getItem("tasks") || "[]");
  const total = entries.length;
  const completed = entries.filter((e: { completed: boolean }) => e.completed).length;
  const pending = total - completed;
  return { total, completed, pending };
}

export default function Dashboard() {
  const weight = getWeightMetrics();
  const workout = getWorkoutMetrics();
  const task = getTaskMetrics();
  const gridCols = useBreakpointValue({ base: 1, sm: 2, md: 3 });

  return (
    <Box p={{ base: 2, md: 6 }}>
      <SimpleGrid columns={gridCols} gap={4}>
        <Box bg="#23232a" p={4} borderRadius="xl" boxShadow="md">
          <Text fontSize="lg" color="gray.400">Latest Weight</Text>
          <Text fontSize="2xl" color="teal.300" fontWeight="bold">{weight.latest} lb</Text>
          <Text fontSize="sm" color="gray.500">Last 7 days: {weight.trend >= 0 ? "+" : ""}{weight.trend} lb</Text>
          <Box mt={2} h="80px">
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={weight.chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#38b2ac" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
        <Box bg="#23232a" p={4} borderRadius="xl" boxShadow="md">
          <Text fontSize="lg" color="gray.400">Workouts</Text>
          <Text fontSize="2xl" color="teal.300" fontWeight="bold">{workout.total}</Text>
          <Text fontSize="sm" color="gray.500">Last: {workout.last}<br />Most: {workout.freqType}</Text>
        </Box>
        <Box bg="#23232a" p={4} borderRadius="xl" boxShadow="md">
          <Text fontSize="lg" color="gray.400">Tasks</Text>
          <Text fontSize="2xl" color="teal.300" fontWeight="bold">{task.completed}/{task.total}</Text>
          <Text fontSize="sm" color="gray.500">Pending: {task.pending}</Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
