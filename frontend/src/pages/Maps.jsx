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
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  VisuallyHidden,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { FiEdit2, FiExternalLink, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import PageLayout from '../components/PageLayout';
import { request, requestJson, safeArray } from '../utils/api';

const emptyForm = {
  name: '',
  address: '',
  lat: '',
  lng: '',
  notes: '',
};

const PlaceCard = ({ place, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: place.name ?? '',
    address: place.address ?? '',
    lat: place.lat ?? '',
    lng: place.lng ?? '',
    notes: place.notes ?? '',
  });
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const toggle = () => {
    setDraft({
      name: place.name ?? '',
      address: place.address ?? '',
      lat: place.lat ?? '',
      lng: place.lng ?? '',
      notes: place.notes ?? '',
    });
    setIsEditing((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(place.id, {
      name: draft.name.trim(),
      address: draft.address.trim(),
      lat: draft.lat === '' ? null : Number(draft.lat),
      lng: draft.lng === '' ? null : Number(draft.lng),
      notes: draft.notes.trim(),
    });
    setIsEditing(false);
  };

  const mapUrl =
    place.lat != null && place.lng != null
      ? `https://www.google.com/maps?q=${encodeURIComponent(place.lat)},${encodeURIComponent(place.lng)}`
      : null;

  return (
    <Box borderWidth="1px" borderColor={borderColor} rounded="lg" p={4}>
      {isEditing ? (
        <Stack as="form" spacing={4} onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel htmlFor={`place-name-${place.id}`}>Name</FormLabel>
            <Input
              id={`place-name-${place.id}`}
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor={`place-address-${place.id}`}>Address</FormLabel>
            <Input
              id={`place-address-${place.id}`}
              value={draft.address}
              onChange={(event) => setDraft((prev) => ({ ...prev, address: event.target.value }))}
            />
          </FormControl>
          <HStack spacing={4} flexWrap="wrap">
            <FormControl maxW={{ base: 'full', md: '200px' }}>
              <FormLabel htmlFor={`place-lat-${place.id}`}>Latitude</FormLabel>
              <Input
                id={`place-lat-${place.id}`}
                value={draft.lat}
                onChange={(event) => setDraft((prev) => ({ ...prev, lat: event.target.value }))}
              />
            </FormControl>
            <FormControl maxW={{ base: 'full', md: '200px' }}>
              <FormLabel htmlFor={`place-lng-${place.id}`}>Longitude</FormLabel>
              <Input
                id={`place-lng-${place.id}`}
                value={draft.lng}
                onChange={(event) => setDraft((prev) => ({ ...prev, lng: event.target.value }))}
              />
            </FormControl>
          </HStack>
          <FormControl>
            <FormLabel htmlFor={`place-notes-${place.id}`}>Notes</FormLabel>
            <Textarea
              id={`place-notes-${place.id}`}
              value={draft.notes}
              onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
              rows={3}
            />
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
                {place.name}
              </Heading>
              {place.address ? (
                <Text fontSize="sm" color={mutedColor}>
                  {place.address}
                </Text>
              ) : null}
            </Stack>
            <HStack spacing={2}>
              <IconButton
                aria-label="Edit saved place"
                icon={<Icon as={FiEdit2} />}
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              />
              <IconButton
                aria-label="Delete saved place"
                icon={<Icon as={FiTrash2} />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => onDelete(place.id)}
              />
            </HStack>
          </HStack>
          {place.notes ? (
            <Text fontSize="sm" color={mutedColor} whiteSpace="pre-wrap">
              {place.notes}
            </Text>
          ) : null}
          {mapUrl ? (
            <Link
              href={mapUrl}
              isExternal
              color={useColorModeValue('blue.600', 'blue.300')}
              display="inline-flex"
              alignItems="center"
              gap={2}
            >
              Open in Maps
              <Icon as={FiExternalLink} aria-hidden="true" />
            </Link>
          ) : null}
          {place.lat != null && place.lng != null ? (
            <Badge alignSelf="flex-start" variant="subtle">
              {place.lat}, {place.lng}
            </Badge>
          ) : null}
        </Stack>
      )}
    </Box>
  );
};

const Maps = () => {
  const [places, setPlaces] = useState([]);
  const [formState, setFormState] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const loadPlaces = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await request('/api/places');
      setPlaces(safeArray(data));
    } catch (err) {
      setError('Unable to load saved places right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formState.name.trim()) {
      setStatusMessage('Name is required to save a place.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Saving place…');
    try {
      await requestJson('/api/places', {
        method: 'POST',
        body: JSON.stringify({
          name: formState.name.trim(),
          address: formState.address.trim() || undefined,
          lat: formState.lat === '' ? null : Number(formState.lat),
          lng: formState.lng === '' ? null : Number(formState.lng),
          notes: formState.notes.trim() || undefined,
        }),
      });
      setFormState(emptyForm);
      setStatusMessage('Place saved.');
      await loadPlaces();
    } catch (err) {
      setStatusMessage('Failed to save the place.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setStatusMessage('Removing place…');
    try {
      await request(`/api/places/${id}`, { method: 'DELETE' });
      setStatusMessage('Place removed.');
      await loadPlaces();
    } catch (err) {
      setStatusMessage('Unable to remove the place.');
    }
  };

  const handleSave = async (id, payload) => {
    setStatusMessage('Updating place…');
    try {
      await requestJson(`/api/places/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setStatusMessage('Place updated.');
      await loadPlaces();
    } catch (err) {
      setStatusMessage('Failed to update the place.');
    }
  };

  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <PageLayout
      title="Maps"
      description="Remember favorite spots and discoveries wherever you go."
      actions={null}
    >
      <VisuallyHidden role="status" aria-live="polite">
        {statusMessage}
      </VisuallyHidden>

      <Box
        as="section"
        aria-labelledby="place-form-heading"
        borderWidth="1px"
        borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
        rounded="xl"
        bg={useColorModeValue('white', 'whiteAlpha.100')}
        p={{ base: 4, md: 6 }}
      >
        <Stack spacing={6}>
          <Box>
            <Heading as="h2" id="place-form-heading" size="md" mb={2}>
              Save a place
            </Heading>
            <Text fontSize="sm" color={mutedColor}>
              Track destinations, meeting spots, and creative hangouts.
            </Text>
          </Box>

          <Box as="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel htmlFor="place-name">Name</FormLabel>
                <Input
                  id="place-name"
                  name="name"
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Auirah HQ"
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="place-address">Address</FormLabel>
                <Input
                  id="place-address"
                  name="address"
                  value={formState.address}
                  onChange={(event) => setFormState((prev) => ({ ...prev, address: event.target.value }))}
                  placeholder="123 Aurora Ave"
                />
              </FormControl>

              <HStack spacing={4} flexWrap="wrap">
                <FormControl maxW={{ base: 'full', md: '200px' }}>
                  <FormLabel htmlFor="place-lat">Latitude</FormLabel>
                  <Input
                    id="place-lat"
                    name="lat"
                    value={formState.lat}
                    onChange={(event) => setFormState((prev) => ({ ...prev, lat: event.target.value }))}
                  />
                </FormControl>
                <FormControl maxW={{ base: 'full', md: '200px' }}>
                  <FormLabel htmlFor="place-lng">Longitude</FormLabel>
                  <Input
                    id="place-lng"
                    name="lng"
                    value={formState.lng}
                    onChange={(event) => setFormState((prev) => ({ ...prev, lng: event.target.value }))}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel htmlFor="place-notes">Notes</FormLabel>
                <Textarea
                  id="place-notes"
                  name="notes"
                  value={formState.notes}
                  onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                  rows={3}
                />
              </FormControl>

              <Button type="submit" colorScheme="blue" alignSelf="flex-start" isLoading={isSubmitting}>
                Save place
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box as="section" aria-labelledby="place-list-heading">
        <Heading as="h2" id="place-list-heading" size="md" mb={4}>
          Saved places
        </Heading>

        {error ? (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        ) : null}

        {isLoading ? (
          <Text color={mutedColor}>Loading places…</Text>
        ) : places.length ? (
          <Stack spacing={4}>
            {places.map((place) => (
              <PlaceCard key={place.id ?? place.name} place={place} onSave={handleSave} onDelete={handleDelete} />
            ))}
          </Stack>
        ) : (
          <Text color={mutedColor}>No places saved yet. Add one to start your map.</Text>
        )}
      </Box>
    </PageLayout>
  );
};

export default Maps;
