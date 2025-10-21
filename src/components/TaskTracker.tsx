import React, { useState, useEffect } from "react";
import { Box, Stack, Text } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { getTasks, addTask as apiAddTask, deleteTask as apiDeleteTask, Task } from "../api/tasks";
import FormInput from "./shared/FormInput";
import Button from "./shared/Button";

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
          <Box as="form" role="form" aria-labelledby="task-form-heading"
            onSubmit={e => {
              e.preventDefault();
              addTask();
            }}
          >
            <Text id="task-form-heading" fontSize="lg" fontWeight="bold" mb={4}>Add New Task</Text>
            <Stack direction={{ base: "column", md: "row" }} align="end" gap={3}>
              <Box flex={1}>
                <FormInput
                  label="Task Title"
                  value={title}
                  onChange={setTitle}
                  placeholder="Enter task title"
                  required
                  aria-label="Task Title"
                />
              </Box>
              <Box flex={1}>
                <FormInput
                  label="Description"
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter description (optional)"
                  aria-label="Task Description"
                />
              </Box>
              <Button
                type="submit"
                variant="solid"
                size="md"
                colorScheme="teal"
                width={{ base: "100%", md: "auto" }}
                loading={loading}
                aria-label="Add Task"
              >
                Add Task
              </Button>
            </Stack>
          </Box>
          <Box mt={6} role="region" aria-labelledby="tasks-heading">
            <Text id="tasks-heading" fontSize="lg" fontWeight="bold" mb={4}>Your Tasks</Text>
            {loading ? (
              <Text color="gray.500">Loading...</Text>
            ) : tasks.length === 0 ? (
              <Text color="gray.500">No tasks yet. Add one above to get started!</Text>
            ) : (
              <Stack gap={2} as="ul" listStyleType="none">
                {tasks.map(task => (
                  <Box
                    key={task.id}
                    data-testid="task-item"
                    as="li"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor="gray.600"
                    bg="surface.800"
                    _hover={{ bg: "surface.700" }}
                  >
                    <Box display="flex" alignItems="center" flex={1}>
                      <Button
                        variant="ghost"
                        size="sm"
                        mr={3}
                        onClick={() => {
                          // toggle locally for tests/UI reactivity
                          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
                        }}
                        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                        _focusVisible={{ boxShadow: "0 0 0 2px #319795" }}
                      >
                        {task.completed ? '✓' : '○'}
                      </Button>
                      <Box>
                        <Text fontWeight={task.completed ? "normal" : "medium"} textDecoration={task.completed ? "line-through" : "none"}>
                          {task.title}
                        </Text>
                        {task.description && (
                          <Text color="gray.500" fontSize="sm" mt={1}>
                            {task.description}
                          </Text>
                        )}
                      </Box>
                    </Box>
                    <Button
                      variant="solid"
                      size="sm"
                      colorScheme="red"
                      onClick={() => deleteTask(task.id)}
                      aria-label={`Delete task: ${task.title}`}
                    >
                      Delete
                    </Button>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default TaskTracker;
