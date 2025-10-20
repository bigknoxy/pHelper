import React, { useState, useEffect } from "react";
import { Box, Stack, Input, Button, Text } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { getTasks, addTask as apiAddTask, deleteTask as apiDeleteTask, Task } from "../api/tasks";

const TaskTracker: React.FC = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getTasks()
      .then((data) => setTasks(data))
      .finally(() => setLoading(false));
  }, [token]);

  const addTask = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const newTask = await apiAddTask(title.trim(), description.trim());
      setTasks(prev => [newTask, ...prev]);
      setTitle("");
      setDescription("");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    setLoading(true);
    try {
      await apiDeleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      {!token ? (
        <Text color="red.400">Please log in to use the Task Tracker.</Text>
      ) : (
        <>
          <form
            onSubmit={e => {
              e.preventDefault();
              addTask();
            }}
          >
            <Stack direction={{ base: "column", md: "row" }} align="end" gap={3}>
              <div>
                <label htmlFor="task-title">Task Title</label>
                <Input
                  id="task-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  aria-label="Task Title"
                />
              </div>
              <div>
                <label htmlFor="task-desc">Description</label>
                <Input
                  id="task-desc"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter description"
                  aria-label="Description"
                />
              </div>
              <Button
                type="submit"
                variant="solid"
                size="md"
                colorScheme="teal"
                borderRadius="md"
                boxShadow="md"
                fontWeight="bold"
                width={{ base: "100%", md: "auto" }}
                _focusVisible={{ boxShadow: "0 0 0 2px #319795" }}
                _hover={{ bg: "teal.300", boxShadow: "lg", cursor: "pointer" }}
                loading={loading}
                aria-label="Add Task"
              >
                Add Task
              </Button>
            </Stack>
          </form>
          <Stack mt={6} gap={2}>
            {loading ? (
              <Text color="gray.500">Loading...</Text>
            ) : tasks.length === 0 ? (
              <Text color="gray.500">No tasks yet.</Text>
            ) : (
              tasks.map(task => (
                <Box
                  key={task.id}
                  data-testid="task-item"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={2}
                  borderWidth="1px"
                  borderRadius="md"
                >
                  <Box display="flex" alignItems="center">
                    <input
                      type="checkbox"
                      aria-label={`complete-${task.id}`}
                      checked={Boolean((task as any).completed)}
                      onChange={() => {
                        // toggle locally for tests/UI reactivity
                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !(t as any).completed } : t))
                      }}
                    />
                    <Text ml={2}>{task.title}</Text>
                    {task.description && (
                      <Text ml={4} color="gray.500" fontSize="sm">
                        {task.description}
                      </Text>
                    )}
                  </Box>
                  <Button
                    variant="solid"
                    size="sm"
                    colorScheme="red"
                    onClick={() => deleteTask(task.id)}
                    aria-label="Delete"
                    _focusVisible={{ boxShadow: "0 0 0 2px #E53E3E" }}
                    loading={false}
                  >
                    Delete
                  </Button>
                </Box>
              ))
            )}
          </Stack>
        </>
      )}
    </Box>
  );
};

export default TaskTracker;
