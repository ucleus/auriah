import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  VisuallyHidden,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import PageLayout from '../components/PageLayout';
import { request, requestJson, safeArray } from '../utils/api';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

const emptyForm = {
  title: '',
  description: '',
  dueDate: '',
  status: 'todo',
};

const TaskCard = ({ task, onStatusChange, onDelete }) => {
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const badgeColorScheme =
    task.status === 'done' ? 'green' : task.status === 'in_progress' ? 'blue' : 'gray';

  return (
    <Box borderWidth="1px" borderColor={borderColor} rounded="lg" p={4}>
      <Stack spacing={3}>
        <HStack justify="space-between" align="flex-start" spacing={3}>
          <Stack spacing={1} flex="1">
            <Heading as="h3" size="sm">
              {task.title}
            </Heading>
            {task.description ? (
              <Text fontSize="sm" color={mutedColor} whiteSpace="pre-wrap">
                {task.description}
              </Text>
            ) : null}
          </Stack>
          <Badge colorScheme={badgeColorScheme}>{STATUS_OPTIONS.find((option) => option.value === task.status)?.label ?? 'To do'}</Badge>
        </HStack>

        {task.due_date ? (
          <Text fontSize="xs" color={mutedColor}>
            Due {new Date(task.due_date).toLocaleString()}
          </Text>
        ) : null}

        <HStack spacing={3} align="center" flexWrap="wrap">
          <FormControl maxW="200px">
            <FormLabel htmlFor={`status-${task.id}`} fontSize="xs" color={mutedColor}>
              Update status
            </FormLabel>
            <Select
              id={`status-${task.id}`}
              value={task.status}
              onChange={(event) => onStatusChange(task.id, event.target.value)}
              size="sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <IconButton
            aria-label="Delete task"
            icon={<Icon as={FiTrash2} />}
            onClick={() => onDelete(task.id)}
            variant="ghost"
            colorScheme="red"
          />
        </HStack>
      </Stack>
    </Box>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [formState, setFormState] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await request('/api/tasks');
      setTasks(safeArray(data));
    } catch (err) {
      setError('Unable to load tasks right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formState.title.trim()) {
      setStatusMessage('Title is required to create a task.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Creating task…');
    try {
      await requestJson('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: formState.title.trim(),
          description: formState.description.trim() || undefined,
          status: formState.status,
          due_date: formState.dueDate ? new Date(formState.dueDate).toISOString() : null,
        }),
      });
      setFormState(emptyForm);
      setStatusMessage('Task created.');
      await loadTasks();
    } catch (err) {
      setStatusMessage('Failed to create the task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    setStatusMessage('Updating task status…');
    try {
      await requestJson(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setStatusMessage('Task status updated.');
      await loadTasks();
    } catch (err) {
      setStatusMessage('Could not update task status.');
    }
  };

  const handleDelete = async (taskId) => {
    setStatusMessage('Removing task…');
    try {
      await request(`/api/tasks/${taskId}`, { method: 'DELETE' });
      setStatusMessage('Task removed.');
      await loadTasks();
    } catch (err) {
      setStatusMessage('Failed to remove the task.');
    }
  };

  const hasTasks = tasks.length > 0;
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const formDescription = useMemo(
    () => 'Add a new task with a due date and status to track your progress.',
    []
  );

  return (
    <PageLayout
      title="Tasks"
      description="Capture your to-dos, track progress, and stay organized."
      actions={null}
    >
      <VisuallyHidden role="status" aria-live="polite">
        {statusMessage}
      </VisuallyHidden>

      <Box
        as="section"
        aria-labelledby="task-form-heading"
        borderWidth="1px"
        borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
        rounded="xl"
        bg={useColorModeValue('white', 'whiteAlpha.100')}
        p={{ base: 4, md: 6 }}
      >
        <Stack spacing={6}>
          <Box>
            <Heading as="h2" id="task-form-heading" size="md" mb={2}>
              Create a task
            </Heading>
            <Text fontSize="sm" color={mutedColor}>
              {formDescription}
            </Text>
          </Box>

          <Box as="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel htmlFor="task-title">Title</FormLabel>
                <Input
                  id="task-title"
                  name="title"
                  value={formState.title}
                  onChange={handleChange('title')}
                  placeholder="Plan the next launch"
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="task-description">Description</FormLabel>
                <Textarea
                  id="task-description"
                  name="description"
                  value={formState.description}
                  onChange={handleChange('description')}
                  placeholder="Outline the major steps"
                  rows={4}
                />
              </FormControl>

              <HStack spacing={4} flexWrap="wrap">
                <FormControl maxW={{ base: 'full', md: '200px' }}>
                  <FormLabel htmlFor="task-status">Status</FormLabel>
                  <Select
                    id="task-status"
                    name="status"
                    value={formState.status}
                    onChange={handleChange('status')}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl maxW={{ base: 'full', md: '260px' }}>
                  <FormLabel htmlFor="task-due-date">Due date</FormLabel>
                  <Input
                    id="task-due-date"
                    name="dueDate"
                    type="datetime-local"
                    value={formState.dueDate}
                    onChange={handleChange('dueDate')}
                  />
                </FormControl>
              </HStack>

              <Button
                type="submit"
                colorScheme="blue"
                alignSelf="flex-start"
                leftIcon={<Icon as={FiCheckCircle} />}
                isLoading={isSubmitting}
              >
                Save task
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box as="section" aria-labelledby="task-list-heading">
        <Heading as="h2" id="task-list-heading" size="md" mb={4}>
          Your tasks
        </Heading>

        {error ? (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        ) : null}

        {!isLoading && !hasTasks ? (
          <Text color={mutedColor}>No tasks yet. Add one above to get started.</Text>
        ) : null}

        {isLoading ? (
          <Text color={mutedColor}>Loading tasks…</Text>
        ) : (
          <Stack spacing={4} mt={hasTasks ? 0 : 4}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id ?? task.title}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </Stack>
        )}
      </Box>
    </PageLayout>
  );
};

export default Tasks;
