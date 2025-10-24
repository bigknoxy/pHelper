import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkoutTemplates, getWorkoutTemplateById, createWorkoutTemplate, updateWorkoutTemplate, deleteWorkoutTemplate, getWorkoutTemplateCategories } from '../api/workoutTemplates';
export function useWorkoutTemplates(filters = {}, enabled = true) {
    const queryClient = useQueryClient();
    const { data, isLoading, error, } = useQuery({
        queryKey: ['workout-templates', filters],
        queryFn: () => getWorkoutTemplates(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled,
    });
    const createTemplateMutation = useMutation({
        mutationFn: (template) => createWorkoutTemplate(template),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workout-templates'] });
        },
        onError: (err) => {
            console.error('createWorkoutTemplate failed', err);
        },
    });
    const updateTemplateMutation = useMutation({
        mutationFn: ({ id, template }) => updateWorkoutTemplate(id, template),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workout-templates'] });
        },
        onError: (err) => {
            console.error('updateWorkoutTemplate failed', err);
        },
    });
    const deleteTemplateMutation = useMutation({
        mutationFn: (id) => deleteWorkoutTemplate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workout-templates'] });
        },
        onError: (err) => {
            console.error('deleteWorkoutTemplate failed', err);
        },
    });
    return {
        templates: data?.templates || [],
        total: data?.total || 0,
        isLoading,
        error,
        createTemplate: createTemplateMutation.mutateAsync,
        updateTemplate: updateTemplateMutation.mutateAsync,
        deleteTemplate: deleteTemplateMutation.mutateAsync,
        isCreating: createTemplateMutation.status === 'pending',
        isUpdating: updateTemplateMutation.status === 'pending',
        isDeleting: deleteTemplateMutation.status === 'pending',
    };
}
export function useWorkoutTemplate(id, enabled = true) {
    return useQuery({
        queryKey: ['workout-template', id],
        queryFn: () => getWorkoutTemplateById(id),
        staleTime: 1000 * 60 * 10, // 10 minutes
        enabled: enabled && !!id,
    });
}
export function useWorkoutTemplateCategories() {
    return useQuery({
        queryKey: ['workout-template-categories'],
        queryFn: getWorkoutTemplateCategories,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
