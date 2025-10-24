import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPersonalRecords, getPersonalRecordById, getPersonalRecordStats, deletePersonalRecord } from '../api/personalRecords';
export function usePersonalRecords(filters = {}, enabled = true) {
    const queryClient = useQueryClient();
    const { data, isLoading, error, } = useQuery({
        queryKey: ['personal-records', filters],
        queryFn: () => getPersonalRecords(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        enabled,
    });
    const records = data?.records || [];
    const total = data?.total || 0;
    const deleteRecordMutation = useMutation({
        mutationFn: async (id) => {
            await deletePersonalRecord(id);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['personal-records'] });
        },
        onError: (err) => {
            console.error('deletePersonalRecord failed', err);
        },
    });
    return {
        records,
        total,
        isLoading,
        error,
        deleteRecord: deleteRecordMutation.mutateAsync,
        isDeleting: deleteRecordMutation.status === 'pending',
    };
}
export function usePersonalRecord(id, enabled = true) {
    return useQuery({
        queryKey: ['personal-record', id],
        queryFn: () => getPersonalRecordById(id),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        enabled: enabled && !!id,
    });
}
export function usePersonalRecordStats(exerciseId, enabled = true) {
    return useQuery({
        queryKey: ['personal-record-stats', exerciseId],
        queryFn: () => getPersonalRecordStats(exerciseId),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        enabled,
    });
}
