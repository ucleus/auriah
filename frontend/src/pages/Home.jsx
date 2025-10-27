import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  IconButton,
  Link,
  Stack,
  Text,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
  VisuallyHidden,
} from '@chakra-ui/react';
import { SkipNavContent, SkipNavLink } from '@chakra-ui/skip-nav';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiGrid, FiMic, FiMoon, FiSearch, FiSun } from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const FALLBACK_PROMPTS = [
  'Discover mindful routines for a calmer day',
  'Learn a new chord progression for guitar',
  'Create a photo journal entry for today',
  'Explore hidden art exhibits nearby',
  'Plan a productivity sprint for the week',
  'Find ambient music to focus with',
];

const QUICK_APPS = [
  { label: 'Tasks', path: '/tasks' },
  { label: 'Notes', path: '/notes' },
  { label: 'Music', path: '/music' },
  { label: 'Photos', path: '/photos' },
  { label: 'Learn', path: '/learn' },
  { label: 'Maps', path: '/maps' },
];

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Auirah Apps', href: '/apps' },
  { label: 'Privacy', href: '/privacy' },
];

const FOOTER_LEFT = [
  { label: 'United States' },
  { label: 'Advertising', href: '/advertising' },
  { label: 'Business', href: '/business' },
  { label: 'How Search works', href: '/how-search-works' },
];

const FOOTER_RIGHT = [
  { label: 'English', href: '/lang/en' },
  { label: 'Español', href: '/lang/es' },
  { label: 'Tiếng Việt', href: '/lang/vi' },
  { label: 'Français', href: '/lang/fr' },
  { label: 'Settings', href: '/settings' },
];

const SUGGESTION_LIST_ID = 'auirah-suggestion-list';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Home = () => {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const cardBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const surfaceBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const surfaceHover = useColorModeValue('blackAlpha.50', 'whiteAlpha.200');
  const iconButtonBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.200');
  const iconButtonHover = useColorModeValue('blackAlpha.100', 'whiteAlpha.300');
  const buttonBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.200');
  const buttonHover = useColorModeValue('blackAlpha.100', 'whiteAlpha.300');
  const navLinkColor = useColorModeValue('gray.700', 'gray.200');
  const navLinkHoverColor = useColorModeValue('gray.900', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');
  const footerTextColor = useColorModeValue('gray.600', 'gray.300');
  const footerLinkHoverColor = useColorModeValue('gray.800', 'white');
  const boxShadow = useColorModeValue('0 10px 30px rgba(44, 114, 255, 0.12)', '0 10px 30px rgba(106, 227, 255, 0.12)');
  const badgeBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  const badgeColor = useColorModeValue('gray.600', 'whiteAlpha.800');

  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [statusMessage, setStatusMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const greeting = useMemo(() => getGreeting(), []);
  const greetingDetail = useMemo(() => `${greeting}, friend`, [greeting]);
  const showGreetingIcon = useBreakpointValue({ base: false, md: true });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== '/' || !inputRef.current) {
        return;
      }

      const target = event.target;
      const isEditable =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
          target.getAttribute('role') === 'textbox');

      if (!isEditable) {
        event.preventDefault();
        inputRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      setActiveIndex(-1);
      setStatusMessage('');
      return undefined;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/suggestions?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        setSuggestions(list);
        setIsSuggestionsOpen(list.length > 0);
        setStatusMessage(
          list.length
            ? `${list.length} suggestion${list.length === 1 ? '' : 's'} available`
            : 'No suggestions available'
        );
        setActiveIndex(-1);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSuggestions([]);
          setIsSuggestionsOpen(false);
          setStatusMessage('Suggestions unavailable at the moment');
        }
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  const submitSearch = useCallback(
    (searchTerm) => {
      const term = (searchTerm ?? query).trim();
      if (!term) return;
      setIsSuggestionsOpen(false);
      setActiveIndex(-1);
      navigate(`/search?q=${encodeURIComponent(term)}`);
    },
    [navigate, query]
  );

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    submitSearch(suggestion);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    submitSearch();
  };

  const handleInputKeyDown = (event) => {
    if (!suggestions.length && event.key !== 'Enter') return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsSuggestionsOpen(true);
      setActiveIndex((prev) => {
        const next = prev + 1;
        return next >= suggestions.length ? 0 : next;
      });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsSuggestionsOpen(true);
      setActiveIndex((prev) => {
        if (prev <= 0) {
          return suggestions.length - 1;
        }
        return prev - 1;
      });
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        event.preventDefault();
        handleSuggestionClick(suggestions[activeIndex]);
      }
    } else if (event.key === 'Escape') {
      setIsSuggestionsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleVoiceToggle = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMessage('Voice search is not supported in this browser');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setStatusMessage('Unable to start voice search');
      setIsListening(false);
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setQuery(transcript);
        submitSearch(transcript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleFeelingInspired = async () => {
    let prompt = FALLBACK_PROMPTS[Math.floor(Math.random() * FALLBACK_PROMPTS.length)];
    try {
      const response = await fetch('/api/inspired');
      if (response.ok) {
        const data = await response.json();
        if (typeof data === 'string' && data.trim()) {
          prompt = data.trim();
        } else if (data && typeof data === 'object') {
          if (typeof data.prompt === 'string' && data.prompt.trim()) {
            prompt = data.prompt.trim();
          } else if (Array.isArray(data.prompts) && data.prompts.length) {
            const random = data.prompts[Math.floor(Math.random() * data.prompts.length)];
            if (typeof random === 'string' && random.trim()) {
              prompt = random.trim();
            }
          }
        } else if (Array.isArray(data) && data.length) {
          const random = data[Math.floor(Math.random() * data.length)];
          if (typeof random === 'string' && random.trim()) {
            prompt = random.trim();
          }
        }
      }
    } catch (error) {
      // Ignore network errors, fallback will be used
    }

    submitSearch(prompt);
  };

  const activeDescendant = activeIndex >= 0 && suggestions[activeIndex]
    ? `${SUGGESTION_LIST_ID}-item-${activeIndex}`
    : undefined;

  return (
    <Grid
      minH="100vh"
      templateRows="auto 1fr auto"
      bg={useColorModeValue('#ffffff', '#0f1115')}
      color={useColorModeValue('gray.900', 'gray.100')}
    >
      <SkipNavLink>Skip to main content</SkipNavLink>
      <Flex
        as="header"
        px={{ base: 4, md: 6 }}
        py={3}
        align="center"
        justify="space-between"
        wrap="wrap"
        gap={3}
      >
        <HStack spacing={{ base: 3, md: 4 }} fontSize="sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              as={RouterLink}
              to={link.href}
              color={navLinkColor}
              _hover={{ color: navLinkHoverColor }}
            >
              {link.label}
            </Link>
          ))}
        </HStack>
        <HStack spacing={3} align="center">
          <Badge
            borderRadius="full"
            px={3}
            py={1}
            bg={badgeBg}
            color={badgeColor}
            fontWeight="medium"
            fontSize="xs"
          >
            {greetingDetail}
          </Badge>
          <IconButton
            variant="ghost"
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={<Icon as={colorMode === 'light' ? FiMoon : FiSun} boxSize={5} />}
            onClick={toggleColorMode}
            rounded="full"
          />
        </HStack>
      </Flex>

      <SkipNavContent />
      <Flex as="main" align="center" justify="center" px={4} py={{ base: 10, md: 16 }}>
        <Stack spacing={8} align="center" maxW="640px" w="full">
          <Box fontFamily="'Product Sans', 'Inter', sans-serif" fontWeight="bold" fontSize={{ base: '5xl', sm: '6xl', md: '7xl' }} letterSpacing="-0.08em" lineHeight="1">
            <Box as="span" color="#ff4da6">A</Box>
            <Box as="span" color="#00e6e6">u</Box>
            <Box as="span" color="#6ec6ff">i</Box>
            <Box as="span" color="#ff2b75">r</Box>
            <Box as="span" color="#ffd43b">a</Box>
            <Box as="span" color="#b77dff">h</Box>
          </Box>

          <Text fontSize="md" color={mutedTextColor}>
            {showGreetingIcon ? `${greetingDetail} ✨` : `${greetingDetail}!`}
          </Text>

          <Box w="full">
            <Box
              as="form"
              role="search"
              onSubmit={handleSearchSubmit}
              rounded="full"
              borderBottomRadius={isSuggestionsOpen ? '0' : 'full'}
              borderWidth="1px"
              borderColor={surfaceBorder}
              bg={cardBg}
              px={4}
              py={2}
              boxShadow={boxShadow}
              display="flex"
              alignItems="center"
              gap={2}
              aria-label="Auirah Search"
              autoComplete="off"
            >
              <IconButton
                icon={<Icon as={FiGrid} boxSize={4} />}
                aria-label="Open apps"
                variant="ghost"
                rounded="full"
                bg={iconButtonBg}
                _hover={{ bg: iconButtonHover }}
                type="button"
                borderWidth="1px"
                borderColor={surfaceBorder}
              />
              <Box
                role="combobox"
                aria-expanded={isSuggestionsOpen}
                aria-controls={SUGGESTION_LIST_ID}
                aria-haspopup="listbox"
                flex="1"
                display="flex"
              >
                <VisuallyHidden as="label" htmlFor="home-search-input">
                  Search the web or press slash to focus
                </VisuallyHidden>
                <Box
                  as="input"
                  id="home-search-input"
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search the web or ‘/’ to focus…"
                  aria-label="Search"
                  aria-autocomplete="list"
                  aria-controls={SUGGESTION_LIST_ID}
                  aria-activedescendant={activeDescendant}
                  aria-expanded={isSuggestionsOpen}
                  autoComplete="off"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'inherit',
                    width: '100%',
                    fontSize: '16px',
                  }}
                />
              </Box>
              <IconButton
                icon={<Icon as={FiMic} boxSize={4} />}
                aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
                variant="ghost"
                rounded="full"
                bg={isListening ? 'blue.500' : iconButtonBg}
                color={isListening ? 'white' : 'inherit'}
                _hover={{ bg: isListening ? 'blue.600' : iconButtonHover }}
                type="button"
                onClick={handleVoiceToggle}
                aria-pressed={isListening}
                borderWidth="1px"
                borderColor={isListening ? 'blue.500' : surfaceBorder}
              />
              <IconButton
                icon={<Icon as={FiSearch} boxSize={4} />}
                aria-label="Submit search"
                type="submit"
                variant="ghost"
                rounded="full"
                bg={iconButtonBg}
                _hover={{ bg: iconButtonHover }}
                borderWidth="1px"
                borderColor={surfaceBorder}
              />
            </Box>

            {isSuggestionsOpen && (
              <Box
                id={SUGGESTION_LIST_ID}
                role="listbox"
                aria-label="Search suggestions"
                mt="0"
                bg={cardBg}
                borderWidth="1px"
                borderColor={surfaceBorder}
                borderTopRadius={0}
                borderBottomRadius="xl"
                borderTopWidth="0"
                overflow="hidden"
              >
                {suggestions.map((item, index) => (
                  <Box
                    key={`${item}-${index}`}
                    id={`${SUGGESTION_LIST_ID}-item-${index}`}
                    role="option"
                    aria-selected={activeIndex === index}
                    px={4}
                    py={2.5}
                    cursor="pointer"
                    bg={activeIndex === index ? surfaceHover : 'transparent'}
                    _hover={{ bg: surfaceHover }}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSuggestionClick(item)}
                  >
                    {item}
                  </Box>
                ))}
              </Box>
            )}

            <VisuallyHidden aria-live="polite" role="status">
              {statusMessage}
            </VisuallyHidden>
          </Box>

          <HStack spacing={3} justify="center" flexWrap="wrap">
            <Button
              onClick={submitSearch}
              isDisabled={!query.trim()}
              bg={buttonBg}
              borderWidth="1px"
              borderColor={surfaceBorder}
              _hover={{ bg: buttonHover }}
              px={6}
              py={2.5}
              rounded="md"
              fontSize="sm"
            >
              Auirah Search
            </Button>
            <Button
              onClick={handleFeelingInspired}
              bg={buttonBg}
              borderWidth="1px"
              borderColor={surfaceBorder}
              _hover={{ bg: buttonHover }}
              px={6}
              py={2.5}
              rounded="md"
              fontSize="sm"
            >
              I'm Feeling Inspired
            </Button>
          </HStack>

          <HStack
            spacing={2}
            wrap="wrap"
            justify="center"
            aria-label="Quick apps"
          >
            {QUICK_APPS.map((app) => (
              <Button
                key={app.label}
                as={RouterLink}
                to={app.path}
                rounded="full"
                borderWidth="1px"
                borderColor={surfaceBorder}
                bg={buttonBg}
                _hover={{ bg: buttonHover }}
                size="sm"
                px={4}
                py={2}
              >
                {app.label}
              </Button>
            ))}
          </HStack>
        </Stack>
      </Flex>

      <Flex
        as="footer"
        px={{ base: 4, md: 6 }}
        py={4}
        justify="space-between"
        wrap="wrap"
        gap={3}
        borderTopWidth="1px"
        borderColor={surfaceBorder}
        color={footerTextColor}
      >
        <HStack spacing={4} wrap="wrap">
          {FOOTER_LEFT.map((item) =>
            item.href ? (
              <Link key={item.label} as={RouterLink} to={item.href} _hover={{ color: footerLinkHoverColor }}>
                {item.label}
              </Link>
            ) : (
              <Text key={item.label}>{item.label}</Text>
            )
          )}
        </HStack>
        <HStack spacing={4} wrap="wrap">
          {FOOTER_RIGHT.map((item) => (
            <Link key={item.label} as={RouterLink} to={item.href ?? '#'} _hover={{ color: footerLinkHoverColor }}>
              {item.label}
            </Link>
          ))}
        </HStack>
      </Flex>
    </Grid>
  );
};

export default Home;
