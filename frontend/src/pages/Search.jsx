import {
  Badge,
  Box,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  VisuallyHidden,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { FiArrowUpRight, FiSearch } from 'react-icons/fi';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { API_BASE, request, safeArray, safeObject } from '../utils/api';

const Section = ({ title, description, children }) => {
  const cardBg = useColorModeValue('white', 'whiteAlpha.100');
  const cardBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');

  return (
    <Box borderWidth="1px" borderColor={cardBorder} rounded="xl" bg={cardBg} p={{ base: 4, md: 6 }}>
      <Stack spacing={4}>
        <Box>
          <Heading as="h2" size="md" mb={1}>
            {title}
          </Heading>
          {description ? (
            <Text color={useColorModeValue('gray.600', 'gray.300')} fontSize="sm">
              {description}
            </Text>
          ) : null}
        </Box>
        {children}
      </Stack>
    </Box>
  );
};

const categoryConfigurations = [
  {
    key: 'tasks',
    title: 'Tasks',
    description: 'Track action items and their progress.',
    empty: 'No tasks match this search yet.',
    render: (item) => {
      const statusLabel =
        item.status === 'done'
          ? 'Completed'
          : item.status === 'in_progress'
          ? 'In progress'
          : 'To do';
      return (
        <Stack
          key={item.id ?? `${item.title}-${item.status}`}
          spacing={2}
          borderWidth="1px"
          borderRadius="lg"
          p={4}
          borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
        >
          <Stack direction="row" justify="space-between" align="center">
            <Heading as="h3" size="sm">
              {item.title}
            </Heading>
            {item.status ? (
              <Badge colorScheme={item.status === 'done' ? 'green' : item.status === 'in_progress' ? 'blue' : 'gray'}>
                {statusLabel}
              </Badge>
            ) : null}
          </Stack>
          {item.description ? <Text fontSize="sm">{item.description}</Text> : null}
          {item.due_date ? (
            <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
              Due {new Date(item.due_date).toLocaleString()}
            </Text>
          ) : null}
        </Stack>
      );
    },
  },
  {
    key: 'notes',
    title: 'Notes',
    description: 'Ideas, highlights, and written thoughts.',
    empty: 'No notes found for this search.',
    render: (item) => (
      <Stack
        key={item.id ?? `${item.title}-${item.tags}`}
        spacing={2}
        borderWidth="1px"
        borderRadius="lg"
        p={4}
        borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
      >
        <Heading as="h3" size="sm">
          {item.title}
        </Heading>
        {item.tags ? (
          <Stack direction="row" wrap="wrap" spacing={2} fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
            {item.tags
              ?.split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
              .map((tag) => (
                <Badge key={tag} colorScheme="purple" variant="subtle">
                  {tag}
                </Badge>
              ))}
          </Stack>
        ) : null}
        {item.body ? (
          <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.200')}>
            {item.body}
          </Text>
        ) : null}
      </Stack>
    ),
  },
  {
    key: 'music',
    title: 'Music',
    description: 'Playlists and tracks to keep you inspired.',
    empty: 'No music links yet — add your favorites!',
    render: (item) => (
      <Stack
        key={item.id ?? `${item.title}-${item.platform}`}
        spacing={2}
        borderWidth="1px"
        borderRadius="lg"
        p={4}
        borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
      >
        <Heading as="h3" size="sm">
          {item.title}
        </Heading>
        <Stack direction="row" spacing={2} align="center" fontSize="sm">
          {item.platform ? <Badge variant="subtle">{item.platform}</Badge> : null}
          {item.url ? (
            <Link href={item.url} isExternal display="inline-flex" alignItems="center" gap={1} fontWeight="medium">
              Open link
              <Icon as={FiArrowUpRight} aria-hidden="true" />
            </Link>
          ) : null}
        </Stack>
      </Stack>
    ),
  },
  {
    key: 'photos',
    title: 'Photos',
    description: 'Memories from your uploads.',
    empty: 'No photos found. Upload one from the Photos page.',
    render: (item) => (
      <Stack
        key={item.id ?? item.url}
        spacing={3}
        borderWidth="1px"
        borderRadius="lg"
        p={3}
        borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
      >
        {item.url ? (
          <Image
            src={item.url.startsWith('http') ? item.url : `${API_BASE}${item.url}`}
            alt={item.caption || item.filename || 'Uploaded photo'}
            borderRadius="md"
            objectFit="cover"
          />
        ) : null}
        {item.caption ? (
          <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.200')}>
            {item.caption}
          </Text>
        ) : null}
      </Stack>
    ),
  },
  {
    key: 'learn',
    title: 'Learn',
    description: 'Courses and learning resources.',
    empty: 'No learning resources discovered yet.',
    render: (item) => (
      <Stack
        key={item.id ?? `${item.title}-${item.url}`}
        spacing={2}
        borderWidth="1px"
        borderRadius="lg"
        p={4}
        borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
      >
        <Heading as="h3" size="sm">
          {item.title}
        </Heading>
        {item.category ? <Badge variant="subtle">{item.category}</Badge> : null}
        {item.url ? (
          <Link href={item.url} isExternal display="inline-flex" alignItems="center" gap={1} fontWeight="medium">
            Visit resource
            <Icon as={FiArrowUpRight} aria-hidden="true" />
          </Link>
        ) : null}
      </Stack>
    ),
  },
  {
    key: 'places',
    title: 'Places',
    description: 'Saved locations and map notes.',
    empty: 'No places saved yet.',
    render: (item) => (
      <Stack
        key={item.id ?? `${item.name}-${item.address}`}
        spacing={2}
        borderWidth="1px"
        borderRadius="lg"
        p={4}
        borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
      >
        <Heading as="h3" size="sm">
          {item.name}
        </Heading>
        {item.address ? (
          <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')}>
            {item.address}
          </Text>
        ) : null}
        {item.notes ? (
          <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.200')}>
            {item.notes}
          </Text>
        ) : null}
        {item.lat && item.lng ? (
          <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
            {item.lat}, {item.lng}
          </Text>
        ) : null}
      </Stack>
    ),
  },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(paramQuery);
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Enter a search term to see results.');

  const fetchResults = useCallback(
    async (term) => {
        const trimmed = term.trim();
        setResults({});
        if (!trimmed) {
          setStatus('Enter a search term to see results.');
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError('');
        setStatus('Searching…');
        try {
          const data = await request(`/api/search?q=${encodeURIComponent(trimmed)}`);
          const normalized = safeObject(data);
          setResults(normalized);
          setStatus(`Showing results for “${trimmed}”.`);
        } catch (err) {
          setError('We could not load search results right now. Please try again.');
          setStatus('Search unavailable.');
        } finally {
          setIsLoading(false);
        }
      },
    []
  );

  useEffect(() => {
    setQuery(paramQuery);
    fetchResults(paramQuery);
  }, [fetchResults, paramQuery]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setResults({});
      setStatus('Enter a search term to see results.');
    }
  };

  const cardBg = useColorModeValue('white', 'whiteAlpha.100');
  const cardBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');

  return (
    <PageLayout
      title="Search Auirah"
      description="Explore tasks, notes, music, and places with a single query."
      quickNav
      actions={
        <Box
          as="form"
          role="search"
          onSubmit={handleSubmit}
          aria-label="Search Auirah"
        >
          <FormControl>
            <FormLabel htmlFor="search-input">Search</FormLabel>
            <InputGroup>
              <Input
                id="search-input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Auirah"
                aria-describedby="search-status"
              />
              <InputRightElement>
                <IconButton
                  type="submit"
                  aria-label="Submit search"
                  icon={<Icon as={FiSearch} />}
                  variant="ghost"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
        </Box>
      }
    >
      <VisuallyHidden id="search-status" role="status" aria-live="polite">
        {status}
      </VisuallyHidden>

      {error ? (
        <Box
          borderWidth="1px"
          borderColor={cardBorder}
          bg={cardBg}
          rounded="lg"
          p={4}
          role="alert"
        >
          <Text fontWeight="medium">{error}</Text>
        </Box>
      ) : null}

      {isLoading ? (
        <Stack direction="row" align="center" spacing={3}>
          <Spinner />
          <Text>Loading results…</Text>
        </Stack>
      ) : null}

      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }} gap={6}>
        {categoryConfigurations.map((category) => {
          const items = safeArray(results[category.key]);
          return (
            <GridItem key={category.key} colSpan={1}>
              <Section title={category.title} description={category.description}>
                {items.length ? (
                  category.key === 'photos' ? (
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                      {items.map((item) => category.render(item))}
                    </SimpleGrid>
                  ) : (
                    <Stack spacing={3}>{items.map((item) => category.render(item))}</Stack>
                  )
                ) : (
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                    {category.empty}
                  </Text>
                )}
              </Section>
            </GridItem>
          );
        })}
      </Grid>

      <Box>
        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
          Want to add more? Try the{' '}
          <Link as={RouterLink} to="/tasks" color={useColorModeValue('blue.600', 'blue.300')}>
            Tasks page
          </Link>{' '}
          or other Auirah apps.
        </Text>
      </Box>
    </PageLayout>
  );
};

export default Search;
