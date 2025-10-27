import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  VisuallyHidden,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiImage, FiTrash2 } from 'react-icons/fi';
import PageLayout from '../components/PageLayout';
import { API_BASE, request, safeArray } from '../utils/api';

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);

  const loadPhotos = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await request('/api/photos');
      setPhotos(safeArray(data));
    } catch (err) {
      setError('Unable to load photos right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setStatusMessage('Select an image to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);
    if (caption.trim()) {
      formData.append('caption', caption.trim());
    }

    setIsSubmitting(true);
    setStatusMessage('Uploading photo…');
    try {
      await request('/api/photos', {
        method: 'POST',
        body: formData,
      });
      setCaption('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setStatusMessage('Photo uploaded.');
      await loadPhotos();
    } catch (err) {
      setStatusMessage('Failed to upload the photo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setStatusMessage('Removing photo…');
    try {
      await request(`/api/photos/${id}`, { method: 'DELETE' });
      setStatusMessage('Photo removed.');
      await loadPhotos();
    } catch (err) {
      setStatusMessage('Unable to remove the photo.');
    }
  };

  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <PageLayout
      title="Photos"
      description="Upload and revisit your favorite visual moments."
      actions={null}
    >
      <VisuallyHidden aria-live="polite" role="status">
        {statusMessage}
      </VisuallyHidden>

      <Box
        as="section"
        aria-labelledby="photo-upload-heading"
        borderWidth="1px"
        borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
        rounded="xl"
        bg={useColorModeValue('white', 'whiteAlpha.100')}
        p={{ base: 4, md: 6 }}
      >
        <Stack spacing={6}>
          <Box>
            <Heading as="h2" id="photo-upload-heading" size="md" mb={2}>
              Upload a photo
            </Heading>
            <Text fontSize="sm" color={mutedColor}>
              Share moments, inspiration boards, and visual reminders.
            </Text>
          </Box>

          <Box as="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel htmlFor="photo-file">Image</FormLabel>
                <Input
                  id="photo-file"
                  name="photo"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <FormHelperText>Supported formats include JPG, PNG, and GIF.</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="photo-caption">Caption</FormLabel>
                <Input
                  id="photo-caption"
                  name="caption"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="Sunset walk inspiration"
                />
              </FormControl>

              <Button type="submit" colorScheme="blue" leftIcon={<Icon as={FiImage} />} isLoading={isSubmitting}>
                Upload photo
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box as="section" aria-labelledby="photo-gallery-heading">
        <Heading as="h2" id="photo-gallery-heading" size="md" mb={4}>
          Photo gallery
        </Heading>

        {error ? (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        ) : null}

        {isLoading ? (
          <Text color={mutedColor}>Loading photos…</Text>
        ) : photos.length ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
            {photos.map((photo) => {
              const src = photo.url?.startsWith('http') ? photo.url : `${API_BASE}${photo.url}`;
              return (
                <Stack
                  key={photo.id ?? photo.url}
                  borderWidth="1px"
                  borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
                  rounded="lg"
                  overflow="hidden"
                  spacing={0}
                >
                  <Image src={src} alt={photo.caption || photo.filename || 'Uploaded photo'} objectFit="cover" maxH="220px" />
                  <Stack spacing={2} p={3} bg={useColorModeValue('white', 'blackAlpha.500')}>
                    {photo.caption ? (
                      <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.200')}>
                        {photo.caption}
                      </Text>
                    ) : null}
                    <HStack justify="space-between" align="center">
                      {photo.uploaded_at ? (
                        <Text fontSize="xs" color={mutedColor}>
                          Uploaded {new Date(photo.uploaded_at).toLocaleString()}
                        </Text>
                      ) : null}
                      <IconButton
                        aria-label="Delete photo"
                        icon={<Icon as={FiTrash2} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDelete(photo.id)}
                      />
                    </HStack>
                  </Stack>
                </Stack>
              );
            })}
          </SimpleGrid>
        ) : (
          <Text color={mutedColor}>No photos yet. Upload a memory above to get started.</Text>
        )}
      </Box>
    </PageLayout>
  );
};

export default Photos;
