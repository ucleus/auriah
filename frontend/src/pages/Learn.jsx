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
  Link,
  Select,
  Stack,
  Text,
  useColorModeValue,
  VisuallyHidden,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { FiEdit2, FiExternalLink, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import PageLayout from '../components/PageLayout';
import { request, requestJson, safeArray } from '../utils/api';

const CATEGORIES = ['Productivity', 'Mindfulness', 'Creativity', 'Technology', 'Wellness'];

const emptyForm = {
  title: '',
  url: '',
  category: 'Productivity',
};

const LearnCard = ({ item, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: item.title ?? '',
    url: item.url ?? '',
    category: item.category ?? 'Productivity',
  });
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const toggle = () => {
    setDraft({ title: item.title ?? '', url: item.url ?? '', category: item.category ?? 'Productivity' });
    setIsEditing((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(item.id, {
      title: draft.title.trim(),
      url: draft.url.trim(),
      category: draft.category,
    });
    setIsEditing(false);
  };

  return (
    <Box borderWidth="1px" borderColor={borderColor} rounded="lg" p={4}>
      {isEditing ? (
        <Stack as="form" spacing={4} onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel htmlFor={`learn-title-${item.id}`}>Title</FormLabel>
            <Input
              id={`learn-title-${item.id}`}
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel htmlFor={`learn-url-${item.id}`}>URL</FormLabel>
            <Input
              id={`learn-url-${item.id}`}
              type="url"
              value={draft.url}
              onChange={(event) => setDraft((prev) => ({ ...prev, url: event.target.value }))}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor={`learn-category-${item.id}`}>Category</FormLabel>
            <Select
              id={`learn-category-${item.id}`}
              value={draft.category}
              onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </FormControl>
          <HStack spacing={3}>
            <Button type="submit" colorScheme="blue" leftIcon={<Icon as={FiSave} />}>Save</Button>
            <Button variant="ghost" onClick={toggle} leftIcon={<Icon as={FiX} />}>
              Cancel
            </Button>
          </HStack>
        </Stack>
      ) : (
        <Stack spacing={3}>
          <HStack justify="space-between" align="flex-start">
            <Stack spacing={1}>
              <Heading as="h3" size="sm">
                {item.title}
              </Heading>
              <Badge alignSelf="flex-start" variant="subtle">
                {item.category}
              </Badge>
            </Stack>
            <HStack spacing={2}>
              <IconButton
                aria-label="Edit learning resource"
                icon={<Icon as={FiEdit2} />}
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              />
              <IconButton
                aria-label="Delete learning resource"
                icon={<Icon as={FiTrash2} />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => onDelete(item.id)}
              />
            </HStack>
          </HStack>
          {item.url ? (
            <Link
              href={item.url}
              isExternal
              color={useColorModeValue('blue.600', 'blue.300')}
              display="inline-flex"
              alignItems="center"
              gap={2}
            >
              View resource
              <Icon as={FiExternalLink} aria-hidden="true" />
            </Link>
          ) : null}
          {item.description ? (
            <Text fontSize="sm" color={mutedColor}>
              {item.description}
            </Text>
          ) : null}
        </Stack>
      )}
    </Box>
  );
};

const Learn = () => {
  const [items, setItems] = useState([]);
  const [formState, setFormState] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await request('/api/learn');
      setItems(safeArray(data));
    } catch (err) {
      setError('Unable to load learning resources right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formState.title.trim() || !formState.url.trim()) {
      setStatusMessage('Title and URL are required for a learning resource.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Saving resource…');
    try {
      await requestJson('/api/learn', {
        method: 'POST',
        body: JSON.stringify({
          title: formState.title.trim(),
          url: formState.url.trim(),
          category: formState.category,
        }),
      });
      setFormState(emptyForm);
      setStatusMessage('Resource saved.');
      await loadItems();
    } catch (err) {
      setStatusMessage('Failed to save the resource.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setStatusMessage('Removing resource…');
    try {
      await request(`/api/learn/${id}`, { method: 'DELETE' });
      setStatusMessage('Resource removed.');
      await loadItems();
    } catch (err) {
      setStatusMessage('Unable to remove the resource.');
    }
  };

  const handleSave = async (id, payload) => {
    setStatusMessage('Updating resource…');
    try {
      await requestJson(`/api/learn/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setStatusMessage('Resource updated.');
      await loadItems();
    } catch (err) {
      setStatusMessage('Failed to update the resource.');
    }
  };

  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <PageLayout
      title="Learn"
      description="Collect tutorials, courses, and inspiration to keep growing."
      actions={null}
    >
      <VisuallyHidden role="status" aria-live="polite">
        {statusMessage}
      </VisuallyHidden>

      <Box
        as="section"
        aria-labelledby="learn-form-heading"
        borderWidth="1px"
        borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
        rounded="xl"
        bg={useColorModeValue('white', 'whiteAlpha.100')}
        p={{ base: 4, md: 6 }}
      >
        <Stack spacing={6}>
          <Box>
            <Heading as="h2" id="learn-form-heading" size="md" mb={2}>
              Add a learning resource
            </Heading>
            <Text fontSize="sm" color={mutedColor}>
              Bookmark the courses, articles, and videos that motivate you.
            </Text>
          </Box>

          <Box as="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel htmlFor="learn-title">Title</FormLabel>
                <Input
                  id="learn-title"
                  name="title"
                  value={formState.title}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Creative coding workshop"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="learn-url">URL</FormLabel>
                <Input
                  id="learn-url"
                  name="url"
                  type="url"
                  value={formState.url}
                  onChange={(event) => setFormState((prev) => ({ ...prev, url: event.target.value }))}
                  placeholder="https://"
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="learn-category">Category</FormLabel>
                <Select
                  id="learn-category"
                  name="category"
                  value={formState.category}
                  onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Button type="submit" colorScheme="blue" alignSelf="flex-start" isLoading={isSubmitting}>
                Save resource
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box as="section" aria-labelledby="learn-list-heading">
        <Heading as="h2" id="learn-list-heading" size="md" mb={4}>
          Your learning library
        </Heading>

        {error ? (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        ) : null}

        {isLoading ? (
          <Text color={mutedColor}>Loading resources…</Text>
        ) : items.length ? (
          <Stack spacing={4}>
            {items.map((item) => (
              <LearnCard key={item.id ?? item.title} item={item} onSave={handleSave} onDelete={handleDelete} />
            ))}
          </Stack>
        ) : (
          <Text color={mutedColor}>No learning resources yet. Add one above.</Text>
        )}
      </Box>
    </PageLayout>
  );
};

export default Learn;
