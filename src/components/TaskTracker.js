import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Box, Stack, Input, Button, Text } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { getTasks, addTask as apiAddTask, deleteTask as apiDeleteTask } from "../api/tasks";
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
    return (_jsx(Box, { p: 4, children: !token ? (_jsx(Text, { color: "red.400", children: "Please log in to use the Task Tracker." })) : (_jsxs(_Fragment, { children: [_jsx("form", { onSubmit: e => {
                        e.preventDefault();
                        addTask();
                    }, children: _jsxs(Stack, { direction: { base: "column", md: "row" }, align: "end", gap: 3, children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "task-title", children: "Task Title" }), _jsx(Input, { id: "task-title", value: title, onChange: e => setTitle(e.target.value), placeholder: "Enter task title", "aria-label": "Task Title" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "task-desc", children: "Description" }), _jsx(Input, { id: "task-desc", value: description, onChange: e => setDescription(e.target.value), placeholder: "Enter description", "aria-label": "Description" })] }), _jsx(Button, { type: "submit", variant: "solid", size: "md", colorScheme: "teal", borderRadius: "md", boxShadow: "md", fontWeight: "bold", width: { base: "100%", md: "auto" }, _focusVisible: { boxShadow: "0 0 0 2px #319795" }, _hover: { bg: "teal.300", boxShadow: "lg", cursor: "pointer" }, loading: loading, "aria-label": "Add Task", children: "Add Task" })] }) }), _jsx(Stack, { mt: 6, gap: 2, children: loading ? (_jsx(Text, { color: "gray.500", children: "Loading..." })) : tasks.length === 0 ? (_jsx(Text, { color: "gray.500", children: "No tasks yet." })) : (tasks.map(task => (_jsxs(Box, { "data-testid": "task-item", display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, borderWidth: "1px", borderRadius: "md", children: [_jsxs(Box, { display: "flex", alignItems: "center", children: [_jsx("input", { type: "checkbox", "aria-label": `complete-${task.id}`, checked: Boolean(task.completed), onChange: () => {
                                            // toggle locally for tests/UI reactivity
                                            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                                        } }), _jsx(Text, { ml: 2, children: task.title }), task.description && (_jsx(Text, { ml: 4, color: "gray.500", fontSize: "sm", children: task.description }))] }), _jsx(Button, { variant: "solid", size: "sm", colorScheme: "red", onClick: () => deleteTask(task.id), "aria-label": "Delete", _focusVisible: { boxShadow: "0 0 0 2px #E53E3E" }, loading: false, children: "Delete" })] }, task.id)))) })] })) }));
};
export default TaskTracker;
