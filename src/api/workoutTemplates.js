import client from './client';
export async function getWorkoutTemplates(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
        }
    });
    const res = await client.get(`/workout-templates?${params.toString()}`);
    return res.data;
}
export async function getWorkoutTemplateById(id) {
    const res = await client.get(`/workout-templates/${id}`);
    return res.data;
}
export async function createWorkoutTemplate(template) {
    const res = await client.post('/workout-templates', template);
    return res.data;
}
export async function updateWorkoutTemplate(id, template) {
    const res = await client.put(`/workout-templates/${id}`, template);
    return res.data;
}
export async function deleteWorkoutTemplate(id) {
    await client.delete(`/workout-templates/${id}`);
}
export async function getWorkoutTemplateCategories() {
    const res = await client.get('/workout-templates/categories');
    return res.data;
}
