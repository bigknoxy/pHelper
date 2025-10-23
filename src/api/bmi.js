import client from './client';
export async function calculateBMI(weight, height) {
    const res = await client.post('/bmi', { weight, height });
    return res.data;
}
