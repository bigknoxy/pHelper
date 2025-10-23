import client from './client';
export async function getWeightGoals() {
    const res = await client.get('/weight-goals');
    return res.data;
}
export async function createWeightGoal(data) {
    const res = await client.post('/weight-goals', data);
    return res.data;
}
export async function updateWeightGoal(id, data) {
    const res = await client.put(`/weight-goals/${id}`, data);
    return res.data;
}
export async function deleteWeightGoal(id) {
    await client.delete(`/weight-goals/${id}`);
}
