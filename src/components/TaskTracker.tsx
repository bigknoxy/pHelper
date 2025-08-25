import React, { useState, useEffect } from "react";
import { Box, Stack, Input, Button, Text, Field } from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/react";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

const LOCAL_STORAGE_KEY = "tasks";

function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
}

const TaskTracker: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Add a new task
  const addTask = () => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    setTitle("");
    setDescription("");
  };

  // Toggle completion
  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  return (
    <Box p={4}>
      <form
        onSubmit={e => {
          e.preventDefault();
          addTask();
        }}
      >
  <Stack gap={3} direction={{ base: "column", md: "row" }} align="end">
          <Field.Root required>
            <label htmlFor="task-title">Task Title</label>
            <Input
              id="task-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter task title"
              aria-label="Task Title"
            />
          </Field.Root>
          <Field.Root>
            <label htmlFor="task-desc">Description</label>
            <Input
              id="task-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter description"
              aria-label="Description"
            />
          </Field.Root>
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
          >
            Add Task
          </Button>
        </Stack>
      </form>
      <Stack mt={6}>
        {tasks.length === 0 ? (
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
              borderWidth={1}
              borderRadius="md"
            >
              <Box display="flex" alignItems="center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                  aria-label={`Mark ${task.title} as complete`}
                  style={{ marginRight: "8px" }}
                />
                <Text ml={2} as={task.completed ? "del" : undefined}>
                  {task.title}
                </Text>
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
              >
                Delete
              </Button>
            </Box>
          ))
        )}
      </Stack>
    </Box>
  );
};

export default TaskTracker;
