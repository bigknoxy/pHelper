import client from './client';
export async function getWorkouts() {
    const res = await client.get('/workouts');
    return res.data;
}
export async function addWorkout(workout) {
    const res = await client.post('/workouts', workout);
    return res.data;
}
export async function deleteWorkout(id) {
    await client.delete(`/workouts/${id}`);
}
