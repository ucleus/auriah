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

const PLATFORMS = ['YouTube', 'Spotify', 'SoundCloud', 'Apple Music', 'Bandcamp'];

const emptyForm = {
  title: '',
  url: '',
  platform: 'YouTube',
};

const MusicCard = ({ item, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: item.title ?? '',
    url: item.url ?? '',
    platform: item.platform ?? 'YouTube',
  });
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const toggle = () => {
    setDraft({ title: item.title ?? '', url: item.url ?? '', platform: item.platform ?? 'YouTube' });
    setIsEditing((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(item.id, {
      title: draft.title.trim(),
      url: draft.url.trim(),
      platform: draft.platform,
    });
    setIsEditing(false);
  };

  return (
    <Box borderWidth="1px" borderColor={borderColor} rounded="lg" p={4}>
      {isEditing ? (
        <Stack as="form" spacing={4} onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel htmlFor={`music-title-${item.id}`}>Title</FormLabel>
            <Input
              id={`music-title-${item.id}`}
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel htmlFor={`music-url-${item.id}`}>URL</FormLabel>
            <Input
              id={`music-url-${item.id}`}
              type="url"
              value={draft.url}
              onChange={(event) => setDraft((prev) => ({ ...prev, url: event.target.value }))}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor={`music-platform-${item.id}`}>Platform</FormLabel>
            <Select
              id={`music-platform-${item.id}`}
              value={draft.platform}
              onChange={(event) => setDraft((prev) => ({ ...prev, platform: event.target.value }))}
            >
              {PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
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
                {item.platform}
              </Badge>
            </Stack>
            <HStack spacing={2}>
              <IconButton
                aria-label="Edit music link"
                icon={<Icon as={FiEdit2} />}
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              />
              <IconButton
                aria-label="Delete music link"
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
              Listen now
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

const Music = () => {
  const [musicItems, setMusicItems] = useState([]);
  const [formState, setFormState] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const loadMusic = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await request('/api/music');
      setMusicItems(safeArray(data));
    } catch (err) {
      setError('Unable to load music links right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMusic();
  }, [loadMusic]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formState.title.trim() || !formState.url.trim()) {
      setStatusMessage('Title and URL are required to save a music link.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Saving music link…');
    try {
      await requestJson('/api/music', {
        method: 'POST',
        body: JSON.stringify({
          title: formState.title.trim(),
          url: formState.url.trim(),
          platform: formState.platform,
        }),
      });
      setFormState(emptyForm);
      setStatusMessage('Music link saved.');
      await loadMusic();
    } catch (err) {
      setStatusMessage('Failed to save the music link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setStatusMessage('Removing music link…');
    try {
      await request(`/api/music/${id}`, { method: 'DELETE' });
      setStatusMessage('Music link removed.');
      await loadMusic();
    } catch (err) {
      setStatusMessage('Unable to remove the music link.');
    }
  };

  const handleSave = async (id, payload) => {
    setStatusMessage('Updating music link…');
    try {
      await requestJson(`/api/music/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setStatusMessage('Music link updated.');
      await loadMusic();
    } catch (err) {
      setStatusMessage('Failed to update the music link.');
    }
  };

  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <PageLayout
      title="Music"
      description="Save playlists and tracks for focus, flow, and celebration."
      actions={null}
    >
      <VisuallyHidden role="status" aria-live="polite">
        {statusMessage}
      </VisuallyHidden>

      <Box
        as="section"
        aria-labelledby="music-form-heading"
        borderWidth="1px"
        borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
        rounded="xl"
        bg={useColorModeValue('white', 'whiteAlpha.100')}
        p={{ base: 4, md: 6 }}
      >
        <Stack spacing={6}>
          <Box>
            <Heading as="h2" id="music-form-heading" size="md" mb={2}>
              Add a music link
            </Heading>
            <Text fontSize="sm" color={mutedColor}>
              Collect your go-to soundtracks from across the web.
            </Text>
          </Box>

          <Box as="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel htmlFor="music-title">Title</FormLabel>
                <Input
                  id="music-title"
                  name="title"
                  value={formState.title}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Focus playlist"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="music-url">URL</FormLabel>
                <Input
                  id="music-url"
                  name="url"
                  type="url"
                  value={formState.url}
                  onChange={(event) => setFormState((prev) => ({ ...prev, url: event.target.value }))}
                  placeholder="https://"
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="music-platform">Platform</FormLabel>
                <Select
                  id="music-platform"
                  name="platform"
                  value={formState.platform}
                  onChange={(event) => setFormState((prev) => ({ ...prev, platform: event.target.value }))}
                >
                  {PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Button type="submit" colorScheme="blue" alignSelf="flex-start" isLoading={isSubmitting}>
                Save link
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box as="section" aria-labelledby="music-list-heading">
        <Heading as="h2" id="music-list-heading" size="md" mb={4}>
          Your saved music
        </Heading>

        {error ? (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        ) : null}

        {isLoading ? (
          <Text color={mutedColor}>Loading music…</Text>
        ) : musicItems.length ? (
          <Stack spacing={4}>
            {musicItems.map((item) => (
              <MusicCard key={item.id ?? item.title} item={item} onSave={handleSave} onDelete={handleDelete} />
            ))}
          </Stack>
        ) : (
          <Text color={mutedColor}>No music saved yet. Add a link to begin.</Text>
        )}
      </Box>
    </PageLayout>
  );
};

export default Music;
