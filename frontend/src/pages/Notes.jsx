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
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  VisuallyHidden,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { FiEdit2, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import PageLayout from '../components/PageLayout';
import { request, requestJson, safeArray } from '../utils/api';

const emptyForm = {
  title: '',
  body: '',
  tags: '',
};

const NoteCard = ({ note, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ title: note.title ?? '', body: note.body ?? '', tags: note.tags ?? '' });
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const handleToggle = () => {
    setDraft({ title: note.title ?? '', body: note.body ?? '', tags: note.tags ?? '' });
    setIsEditing((prev) => !prev);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    await onSave(note.id, {
      title: draft.title.trim(),
      body: draft.body.trim(),
      tags: draft.tags.trim(),
    });
    setIsEditing(false);
  };

  return (
    <Box borderWidth="1px" borderColor={borderColor} rounded="lg" p={4}>
      {isEditing ? (
        <Stack as="form" spacing={4} onSubmit={handleSave}>
          <FormControl isRequired>
            <FormLabel htmlFor={`note-title-${note.id}`}>Title</FormLabel>
            <Input
              id={`note-title-${note.id}`}
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor={`note-body-${note.id}`}>Body</FormLabel>
            <Textarea
              id={`note-body-${note.id}`}
              value={draft.body}
              onChange={(event) => setDraft((prev) => ({ ...prev, body: event.target.value }))}
              rows={4}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor={`note-tags-${note.id}`}>Tags</FormLabel>
            <Input
              id={`note-tags-${note.id}`}
              value={draft.tags}
              onChange={(event) => setDraft((prev) => ({ ...prev, tags: event.target.value }))}
              placeholder="productivity, ideas"
            />
          </FormControl>
          <HStack spacing={3}>
            <Button type="submit" colorScheme="blue" leftIcon={<Icon as={FiSave} />}>Save</Button>
            <Button variant="ghost" onClick={handleToggle} leftIcon={<Icon as={FiX} />}>
              Cancel
            </Button>
          </HStack>
        </Stack>
      ) : (
        <Stack spacing={3}>
          <HStack justify="space-between" align="flex-start">
            <Heading as="h3" size="sm">
              {note.title}
            </Heading>
            <HStack spacing={2}>
              <IconButton
                aria-label="Edit note"
                icon={<Icon as={FiEdit2} />}
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              />
              <IconButton
                aria-label="Delete note"
                icon={<Icon as={FiTrash2} />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => onDelete(note.id)}
              />
            </HStack>
          </HStack>
          {note.tags ? (
            <HStack spacing={2} wrap="wrap">
              {note.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => (
                  <Badge key={tag} variant="subtle" colorScheme="purple">
                    {tag}
                  </Badge>
                ))}
            </HStack>
          ) : null}
          {note.body ? (
            <Text fontSize="sm" color={mutedColor} whiteSpace="pre-wrap">
              {note.body}
            </Text>
          ) : null}
        </Stack>
      )}
    </Box>
  );
};

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [formState, setFormState] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await request('/api/notes');
      setNotes(safeArray(data));
    } catch (err) {
      setError('Unable to load notes right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formState.title.trim()) {
      setStatusMessage('Title is required to create a note.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Saving note…');
    try {
      await requestJson('/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          title: formState.title.trim(),
          body: formState.body.trim() || undefined,
          tags: formState.tags.trim() || undefined,
        }),
      });
      setStatusMessage('Note saved.');
      setFormState(emptyForm);
      await loadNotes();
    } catch (err) {
      setStatusMessage('Failed to save the note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId) => {
    setStatusMessage('Removing note…');
    try {
      await request(`/api/notes/${noteId}`, { method: 'DELETE' });
      setStatusMessage('Note removed.');
      await loadNotes();
    } catch (err) {
      setStatusMessage('Could not remove the note.');
    }
  };

  const handleSave = async (noteId, payload) => {
    setStatusMessage('Updating note…');
    try {
      await requestJson(`/api/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setStatusMessage('Note updated.');
      await loadNotes();
    } catch (err) {
      setStatusMessage('Unable to update the note.');
    }
  };

  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <PageLayout
      title="Notes"
      description="Capture ideas, references, and highlights across your day."
      actions={null}
    >
      <VisuallyHidden aria-live="polite" role="status">
        {statusMessage}
      </VisuallyHidden>

      <Box
        as="section"
        aria-labelledby="note-form-heading"
        borderWidth="1px"
        borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
        rounded="xl"
        bg={useColorModeValue('white', 'whiteAlpha.100')}
        p={{ base: 4, md: 6 }}
      >
        <Stack spacing={6}>
          <Box>
            <Heading as="h2" id="note-form-heading" size="md" mb={2}>
              Create a note
            </Heading>
            <Text fontSize="sm" color={mutedColor}>
              Store quick references, meeting notes, and inspiration in one place.
            </Text>
          </Box>

          <Box as="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel htmlFor="note-title">Title</FormLabel>
                <Input
                  id="note-title"
                  name="title"
                  value={formState.title}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Weekly planning"
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="note-body">Body</FormLabel>
                <Textarea
                  id="note-body"
                  name="body"
                  value={formState.body}
                  onChange={(event) => setFormState((prev) => ({ ...prev, body: event.target.value }))}
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="note-tags">Tags</FormLabel>
                <Input
                  id="note-tags"
                  name="tags"
                  value={formState.tags}
                  onChange={(event) => setFormState((prev) => ({ ...prev, tags: event.target.value }))}
                  placeholder="focus, design, journaling"
                />
              </FormControl>

              <Button type="submit" colorScheme="blue" alignSelf="flex-start" isLoading={isSubmitting}>
                Save note
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box as="section" aria-labelledby="note-list-heading">
        <Heading as="h2" id="note-list-heading" size="md" mb={4}>
          Your notes
        </Heading>

        {error ? (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        ) : null}

        {isLoading ? (
          <Text color={mutedColor}>Loading notes…</Text>
        ) : notes.length ? (
          <Stack spacing={4}>
            {notes.map((note) => (
              <NoteCard key={note.id ?? note.title} note={note} onSave={handleSave} onDelete={handleDelete} />
            ))}
          </Stack>
        ) : (
          <Text color={mutedColor}>No notes yet. Add one to start your collection.</Text>
        )}
      </Box>
    </PageLayout>
  );
};

export default Notes;
