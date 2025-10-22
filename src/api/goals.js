import client from './client';
// API functions
export const getGoals = async () => {
    const response = await client.get('/goals');
    return response.data;
};
export const createGoal = async (data) => {
    const response = await client.post('/goals', data);
    return response.data;
};
export const updateGoal = async (id, data) => {
    const response = await client.put(`/goals/${id}`, data);
    return response.data;
};
export const deleteGoal = async (id) => {
    await client.delete(`/goals/${id}`);
};
export const getGoalAnalytics = async () => {
    const response = await client.get('/analytics/goals');
    return response.data;
};
