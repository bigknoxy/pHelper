import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Box, Stack, Text } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { getTasks, addTask as apiAddTask, deleteTask as apiDeleteTask } from "../api/tasks";
import FormInput from "./shared/FormInput";
import Button from "./shared/Button";
const TaskTracker = () => {
    const { token } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!token)
            return;
        setLoading(true);
        getTasks()
            .then((data) => setTasks(data))
            .finally(() => setLoading(false));
    }, [token]);
    const addTask = async () => {
        if (!title.trim())
            return;
        setLoading(true);
        try {
            const newTask = await apiAddTask(title.trim(), description.trim());
            setTasks(prev => [newTask, ...prev]);
            setTitle("");
            setDescription("");
        }
        finally {
            setLoading(false);
        }
    };
    const deleteTask = async (id) => {
        setLoading(true);
        try {
            await apiDeleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(Box, { p: 4, children: !token ? (_jsx(Text, { color: "red.400", children: "Please log in to use the Task Tracker." })) : (_jsxs(_Fragment, { children: [_jsxs(Box, { as: "form", role: "form", "aria-labelledby": "task-form-heading", onSubmit: e => {
                        e.preventDefault();
                        addTask();
                    }, children: [_jsx(Text, { id: "task-form-heading", fontSize: "lg", fontWeight: "bold", mb: 4, children: "Add New Task" }), _jsxs(Stack, { direction: { base: "column", md: "row" }, align: "end", gap: 3, children: [_jsx(Box, { flex: 1, children: _jsx(FormInput, { label: "Task Title", value: title, onChange: setTitle, placeholder: "Enter task title", required: true, "aria-label": "Task Title" }) }), _jsx(Box, { flex: 1, children: _jsx(FormInput, { label: "Description", value: description, onChange: setDescription, placeholder: "Enter description (optional)", "aria-label": "Task Description" }) }), _jsx(Button, { type: "submit", variant: "solid", size: "md", colorScheme: "teal", width: { base: "100%", md: "auto" }, loading: loading, "aria-label": "Add Task", children: "Add Task" })] })] }), _jsxs(Box, { mt: 6, role: "region", "aria-labelledby": "tasks-heading", children: [_jsx(Text, { id: "tasks-heading", fontSize: "lg", fontWeight: "bold", mb: 4, children: "Your Tasks" }), loading ? (_jsx(Text, { color: "gray.500", children: "Loading..." })) : tasks.length === 0 ? (_jsx(Text, { color: "gray.500", children: "No tasks yet. Add one above to get started!" })) : (_jsx(Stack, { gap: 2, as: "ul", listStyleType: "none", children: tasks.map(task => (_jsxs(Box, { "data-testid": "task-item", as: "li", display: "flex", alignItems: "center", justifyContent: "space-between", p: 3, borderWidth: "1px", borderRadius: "md", borderColor: "gray.600", bg: "surface.800", _hover: { bg: "surface.700" }, children: [_jsxs(Box, { display: "flex", alignItems: "center", flex: 1, children: [_jsx(Button, { variant: "ghost", size: "sm", mr: 3, onClick: () => {
                                                    // toggle locally for tests/UI reactivity
                                                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                                                }, "aria-label": `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`, _focusVisible: { boxShadow: "0 0 0 2px #319795" }, children: task.completed ? '✓' : '○' }), _jsxs(Box, { children: [_jsx(Text, { fontWeight: task.completed ? "normal" : "medium", textDecoration: task.completed ? "line-through" : "none", children: task.title }), task.description && (_jsx(Text, { color: "gray.500", fontSize: "sm", mt: 1, children: task.description }))] })] }), _jsx(Button, { variant: "solid", size: "sm", colorScheme: "red", onClick: () => deleteTask(task.id), "aria-label": `Delete task: ${task.title}`, children: "Delete" })] }, task.id))) }))] })] })) }));
};
export default TaskTracker;
