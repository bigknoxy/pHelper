import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Box, Stack, Input, Button, Text, Field } from "@chakra-ui/react";
const LOCAL_STORAGE_KEY = "tasks";
function loadTasks() {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }
    catch {
        return [];
    }
}
function saveTasks(tasks) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
}
const TaskTracker = () => {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    // Add a new task
    const addTask = () => {
        if (!title.trim())
            return;
        const newTask = {
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
    const toggleComplete = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };
    // Delete a task
    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };
    useEffect(() => {
        setTasks(loadTasks());
    }, []);
    useEffect(() => {
        saveTasks(tasks);
    }, [tasks]);
    return (_jsxs(Box, { p: 4, children: [_jsx("form", { onSubmit: e => {
                    e.preventDefault();
                    addTask();
                }, children: _jsxs(Stack, { gap: 3, direction: { base: "column", md: "row" }, align: "end", children: [_jsxs(Field.Root, { required: true, children: [_jsx("label", { htmlFor: "task-title", children: "Task Title" }), _jsx(Input, { id: "task-title", value: title, onChange: e => setTitle(e.target.value), placeholder: "Enter task title", "aria-label": "Task Title" })] }), _jsxs(Field.Root, { children: [_jsx("label", { htmlFor: "task-desc", children: "Description" }), _jsx(Input, { id: "task-desc", value: description, onChange: e => setDescription(e.target.value), placeholder: "Enter description", "aria-label": "Description" })] }), _jsx(Button, { type: "submit", variant: "solid", size: "md", colorScheme: "teal", borderRadius: "md", boxShadow: "md", fontWeight: "bold", width: { base: "100%", md: "auto" }, _focusVisible: { boxShadow: "0 0 0 2px #319795" }, _hover: { bg: "teal.300", boxShadow: "lg", cursor: "pointer" }, children: "Add Task" })] }) }), _jsx(Stack, { mt: 6, children: tasks.length === 0 ? (_jsx(Text, { color: "gray.500", children: "No tasks yet." })) : (tasks.map(task => (_jsxs(Box, { "data-testid": "task-item", display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, borderWidth: 1, borderRadius: "md", children: [_jsxs(Box, { display: "flex", alignItems: "center", children: [_jsx("input", { type: "checkbox", checked: task.completed, onChange: () => toggleComplete(task.id), "aria-label": `Mark ${task.title} as complete`, style: { marginRight: "8px" } }), _jsx(Text, { ml: 2, as: task.completed ? "del" : undefined, children: task.title }), task.description && (_jsx(Text, { ml: 4, color: "gray.500", fontSize: "sm", children: task.description }))] }), _jsx(Button, { variant: "solid", size: "sm", colorScheme: "red", onClick: () => deleteTask(task.id), "aria-label": "Delete", _focusVisible: { boxShadow: "0 0 0 2px #E53E3E" }, children: "Delete" })] }, task.id)))) })] }));
};
export default TaskTracker;
