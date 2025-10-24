import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWeights, addWeight, deleteWeight } from '../api/weights';
export function useWeights(enabled = true) {
    const queryClient = useQueryClient();
    const { data: weights = [], isLoading, error, } = useQuery({
        queryKey: ['weights'],
        queryFn: getWeights,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        enabled,
    });
    const addWeightMutation = useMutation({
        mutationFn: ({ weight, date, note }) => addWeight(weight, date, note),
        onSuccess: (newWeight) => {
            queryClient.setQueryData(['weights'], (old = []) => [...old, newWeight]);
        },
        onError: (err) => {
            // central place to log/report mutation errors
            console.error('addWeight failed', err);
        },
    });
    const deleteWeightMutation = useMutation({
        mutationFn: async (id) => {
            await deleteWeight(id);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['weights'] });
        },
        onError: (err) => {
            console.error('deleteWeight failed', err);
        },
    });
    return {
        weights,
        isLoading,
        error,
        addWeight: addWeightMutation.mutateAsync,
        deleteWeight: deleteWeightMutation.mutateAsync,
        // derive boolean loading state from mutation.status
        isAdding: addWeightMutation.status === 'pending',
        isDeleting: deleteWeightMutation.status === 'pending',
    };
}
