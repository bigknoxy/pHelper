import client from './client';
export async function getWorkouts() {
    const res = await client.get('/workouts');
    return res.data;
}
export async function addWorkout(type, duration, date, notes) {
    const res = await client.post('/workouts', { type, duration, date, notes });
    return res.data;
}
export async function deleteWorkout(id) {
    await client.delete(`/workouts/${id}`);
}
