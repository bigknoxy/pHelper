import { Box, Flex, useToken } from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import WeightTracker from './components/WeightTracker';
import WorkoutLogger from './components/WorkoutLogger';
import TaskTracker from './components/TaskTracker';
import Dashboard from './components/Dashboard';
import TopBarAuth from './components/TopBarAuth';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import ErrorBoundary from './components/shared/ErrorBoundary';
import './App.css';

function App() {
  const { userId, loading } = useAuth()
  const tabs = [
    { label: "Dashboard", value: "dashboard" },
    { label: "Weight", value: "weight" },
    { label: "Workouts", value: "workouts" },
    { label: "Tasks", value: "tasks" },
  ];
  const [selected, setSelected] = useState("dashboard");

  // resolve color tokens for places that need concrete color strings (e.g. boxShadow, borders)
  const [primary500, primary400, primary300, surface900, surface800] = useToken('colors', [
    'primary.500',
    'primary.400',
    'primary.300',
    'surface.900',
    'surface.800',
  ])

  // Simple client-side routing for /login and /register when not using react-router
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'

  // If auth status is still being determined, show nothing to avoid flash
  if (loading) {
    return <Box p={4}>Loading...</Box>
  }

  // If user is not authenticated and not explicitly navigating to /register,
  // show the login form by default.
  if (!userId && path !== '/register') return (
    <Box p={4}>
      <TopBarAuth />
      <LoginForm />
    </Box>
  )

  if (!userId && path === '/register') return (
    <Box p={4}>
      <TopBarAuth />
      <RegisterForm />
    </Box>
  )

  return (
    <ErrorBoundary>
      <Box bg="background.900" minH="100vh" color="text.inverted">
        <TopBarAuth />
        <Flex
          as="nav"
          gap={4}
          p={4}
          justify="center"
          bg={surface900}
          borderRadius="xl"
          boxShadow="md"
        >
          {tabs.map((tab) => (
            <Box
              key={tab.value}
              as="button"
              role="tab"
              aria-selected={selected === tab.value}
              px={5}
              py={2}
              fontWeight="bold"
              borderRadius="md"
              bg={selected === tab.value ? primary400 : surface900}
              color={selected === tab.value ? "gray.900" : "gray.300"}
              boxShadow={selected === tab.value ? `0 2px 8px ${primary500}80` : undefined}
              border={selected === tab.value ? `2px solid ${primary500}` : "2px solid transparent"}
              transition="all 0.2s"
              _hover={{
                bg: selected === tab.value ? primary300 : surface800,
                color: "white",
                borderColor: primary500,
              }}
              onClick={() => setSelected(tab.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelected(tab.value)
                }
              }}
              aria-pressed={selected === tab.value}
            >
              {tab.label}
            </Box>
          ))}
        </Flex>
        <Box mt={8} px={4}>
    {selected === "dashboard" && <Dashboard />}
    {selected === "weight" && <WeightTracker />}
    {selected === "workouts" && <WorkoutLogger />}
    {selected === "tasks" && <TaskTracker />}
        </Box>
      </Box>
    </ErrorBoundary>
  );
}

export default App;
