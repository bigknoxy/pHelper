import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasks, addTask, deleteTask, Task, updateTask } from '../api/tasks'

export function useTasks(enabled = true) {
  const queryClient = useQueryClient()
  
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery<Task[], Error>({
    queryKey: ['tasks'],
    queryFn: getTasks,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled,
  })

  const addTaskMutation = useMutation({
    mutationFn: ({ title, description }: { title: string; description?: string }) =>
      addTask(title, description),
    onSuccess: (newTask) => {
      queryClient.setQueryData(['tasks'], (old: Task[] = []) => [newTask, ...old])
    },
    onError: (err) => {
       
      console.error('addTask failed', err)
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (err) => {
       
      console.error('deleteTask failed', err)
    },
  })

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => updateTask(id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (err) => {
       
      console.error('toggleTask failed', err)
    },
  })

  return {
    tasks,
    isLoading,
    error,
    addTask: addTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    toggleTask: toggleTaskMutation.mutateAsync,
    // derive boolean loading state from mutation.status
    isAdding: addTaskMutation.status === 'pending',
    isDeleting: deleteTaskMutation.status === 'pending',
    isToggling: toggleTaskMutation.status === 'pending',
  }
}
