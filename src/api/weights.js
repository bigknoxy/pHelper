import client from './client';
export async function getWeights() {
    const res = await client.get('/weights');
    return res.data;
}
export async function addWeight(weight, date, note) {
    const res = await client.post('/weights', { weight, date, note });
    return res.data;
}
export async function deleteWeight(id) {
    await client.delete(`/weights/${id}`);
}
