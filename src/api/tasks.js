import client from './client';
export async function getTasks() {
    const res = await client.get('/tasks');
    return res.data;
}
export async function addTask(title, description, status, dueDate) {
    const res = await client.post('/tasks', { title, description, status, dueDate });
    return res.data;
}
export async function deleteTask(id) {
    await client.delete(`/tasks/${id}`);
}
export async function updateTask(id, updates) {
    const res = await client.patch(`/tasks/${id}`, updates);
    return res.data;
}
