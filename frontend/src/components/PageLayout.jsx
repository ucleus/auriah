import {
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
  VisuallyHidden,
  Wrap,
  WrapItem,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { SkipNavContent, SkipNavLink } from '@chakra-ui/skip-nav';
import { FiMoon, FiSun } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { FOOTER_LEFT, FOOTER_RIGHT, NAV_LINKS, QUICK_APPS } from '../constants/layout';

const BrandMark = () => (
  <Link
    as={RouterLink}
    to="/"
    fontFamily="'Product Sans', 'Inter', sans-serif"
    fontWeight="bold"
    fontSize={{ base: '2xl', md: '3xl' }}
    letterSpacing="-0.08em"
    lineHeight="1"
    aria-label="Return to the Auirah home page"
  >
    <Box as="span" color="#ff4da6">
      A
    </Box>
    <Box as="span" color="#00e6e6">
      u
    </Box>
    <Box as="span" color="#6ec6ff">
      i
    </Box>
    <Box as="span" color="#ff2b75">
      r
    </Box>
    <Box as="span" color="#ffd43b">
      a
    </Box>
    <Box as="span" color="#b77dff">
      h
    </Box>
  </Link>
);

const PageLayout = ({
  title,
  description,
  actions,
  quickNav = true,
  quickNavLabel = 'Quick apps',
  mainProps,
  children,
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const pageBg = useColorModeValue('#ffffff', '#0f1115');
  const pageColor = useColorModeValue('gray.900', 'gray.100');
  const surfaceBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const footerTextColor = useColorModeValue('gray.600', 'gray.300');
  const footerLinkHoverColor = useColorModeValue('gray.800', 'white');
  const navLinkColor = useColorModeValue('gray.700', 'gray.200');
  const navLinkHoverColor = useColorModeValue('gray.900', 'white');
  const quickAppBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.200');
  const quickAppHoverBg = useColorModeValue('blackAlpha.100', 'whiteAlpha.300');

  return (
    <Grid minH="100vh" templateRows="auto 1fr auto" bg={pageBg} color={pageColor}>
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
        <HStack spacing={{ base: 4, md: 6 }} align="center" flexWrap="wrap">
          <BrandMark />
          <HStack spacing={{ base: 3, md: 4 }} fontSize="sm" wrap="wrap">
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
        </HStack>
        <IconButton
          variant="ghost"
          aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
          icon={<Icon as={colorMode === 'light' ? FiMoon : FiSun} boxSize={5} />}
          onClick={toggleColorMode}
          rounded="full"
        />
      </Flex>

      <SkipNavContent />
      <Box
        as="main"
        px={{ base: 4, md: 8 }}
        py={{ base: 8, md: 12 }}
        display="flex"
        justifyContent="center"
        {...mainProps}
      >
        <Stack spacing={8} maxW="960px" w="full">
          <Box>
            <Text as="h1" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold" mb={2}>
              {title}
            </Text>
            {description ? (
              <Text color={useColorModeValue('gray.600', 'gray.300')} fontSize="md">
                {description}
              </Text>
            ) : null}
          </Box>

          {actions}

          {quickNav ? (
            <Stack spacing={2} align="flex-start">
              <Text fontWeight="semibold" fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                {quickNavLabel}
              </Text>
              <Wrap aria-label={quickNavLabel} spacing={2} shouldWrapChildren>
                {QUICK_APPS.map((app) => (
                  <WrapItem key={app.label}>
                    <Button
                      as={RouterLink}
                      to={app.path}
                      rounded="full"
                      borderWidth="1px"
                      borderColor={surfaceBorder}
                      bg={quickAppBg}
                      _hover={{ bg: quickAppHoverBg }}
                      size="sm"
                      px={4}
                      py={2}
                    >
                      {app.label}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </Stack>
          ) : null}

          {children}
        </Stack>
      </Box>

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

      <VisuallyHidden aria-live="polite" role="status">
        Theme is currently {colorMode === 'light' ? 'light' : 'dark'}
      </VisuallyHidden>
    </Grid>
  );
};

export default PageLayout;
