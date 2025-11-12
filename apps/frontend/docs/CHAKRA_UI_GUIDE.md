# Chakra UI Integration Guide

This guide shows how to use Chakra UI components with our romantic pink design system.

## Overview

We're using Chakra UI v3 with a custom romantic theme (`datifyy.theme.ts`) that provides:
- Romantic pink color palette (primary: #f43f5e)
- Premium typography with Playfair Display and Inter
- Soft rounded corners and pink-tinted shadows
- Pre-configured component styles

## Setup

### 1. ChakraProvider Setup

Wrap your app with ChakraProvider and pass the custom theme:

```tsx
// src/App.tsx
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { datifyyTheme } from './theme/datifyy.theme';

// Convert datifyy theme to Chakra theme format
const chakraTheme = extendTheme({
  colors: datifyyTheme.colors,
  fonts: datifyyTheme.fonts,
  fontSizes: datifyyTheme.fontSizes,
  fontWeights: datifyyTheme.fontWeights,
  lineHeights: datifyyTheme.lineHeights,
  letterSpacings: datifyyTheme.letterSpacing,
  space: datifyyTheme.space,
  radii: datifyyTheme.radii,
  shadows: datifyyTheme.shadows,
  breakpoints: datifyyTheme.breakpoints,
  zIndices: datifyyTheme.zIndices,
});

function App() {
  return (
    <ChakraProvider theme={chakraTheme}>
      <YourAppContent />
    </ChakraProvider>
  );
}
```

## Component Examples

### Button Component

Use Chakra UI Button with custom variants:

```tsx
import { Button } from '@chakra-ui/react';

// Primary button (romantic gradient)
<Button
  bgGradient="linear(to-r, primary.500, primary.400, primary.300)"
  color="white"
  borderRadius="full"
  fontWeight="semibold"
  px={10}
  py={6}
  shadow="button"
  _hover={{
    transform: 'translateY(-2px) scale(1.02)',
    shadow: 'buttonHover',
  }}
  _active={{
    transform: 'translateY(0) scale(0.98)',
  }}
  transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
>
  Get Started
</Button>

// Secondary button (outlined)
<Button
  variant="outline"
  borderColor="primary.400"
  color="primary.500"
  borderRadius="full"
  borderWidth="2px"
  fontWeight="semibold"
  px={10}
  py={6}
  _hover={{
    bg: 'primary.50',
    borderColor: 'primary.500',
  }}
>
  Learn More
</Button>

// Ghost button
<Button
  variant="ghost"
  color="gray.700"
  borderRadius="xl"
  fontWeight="medium"
  _hover={{
    bg: 'rgba(244, 63, 94, 0.08)',
    color: 'primary.500',
  }}
>
  Cancel
</Button>

// Loading state
<Button
  isLoading
  loadingText="Sending..."
  bgGradient="linear(to-r, primary.500, primary.400)"
  color="white"
  borderRadius="full"
>
  Send
</Button>

// With icons
<Button
  leftIcon={<HeartIcon />}
  rightIcon={<ArrowRightIcon />}
  bgGradient="linear(to-r, primary.500, primary.400)"
  color="white"
>
  Like Profile
</Button>
```

### Input Component

Use Chakra UI Input with romantic styling:

```tsx
import { FormControl, FormLabel, Input, FormHelperText, FormErrorMessage } from '@chakra-ui/react';

// Basic input
<FormControl>
  <FormLabel color="gray.700" fontWeight="medium">Email</FormLabel>
  <Input
    type="email"
    placeholder="you@example.com"
    focusBorderColor="primary.500"
    borderRadius="xl"
    borderWidth="2px"
    _focus={{
      borderColor: 'primary.500',
      boxShadow: '0 0 0 3px rgba(244, 63, 94, 0.1)',
    }}
  />
  <FormHelperText color="gray.500">
    We'll never share your email.
  </FormHelperText>
</FormControl>

// With error state
<FormControl isInvalid>
  <FormLabel>Password</FormLabel>
  <Input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    focusBorderColor="primary.500"
    borderRadius="xl"
  />
  <FormErrorMessage color="error">
    Password must be at least 8 characters
  </FormErrorMessage>
</FormControl>

// With left/right elements
<InputGroup>
  <InputLeftElement pointerEvents="none">
    <SearchIcon color="gray.400" />
  </InputLeftElement>
  <Input
    placeholder="Search profiles..."
    focusBorderColor="primary.500"
    borderRadius="xl"
  />
  <InputRightElement>
    <Spinner size="sm" color="primary.500" />
  </InputRightElement>
</InputGroup>
```

### Modal Component

Use Chakra UI Modal for dialogs:

```tsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
} from '@chakra-ui/react';

function AuthModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay
          bg="rgba(23, 23, 23, 0.6)"
          backdropFilter="blur(8px)"
        />
        <ModalContent
          borderRadius="2xl"
          shadow="3xl"
          mx={4}
        >
          <ModalHeader
            fontFamily="heading"
            fontSize="2xl"
            fontWeight="semibold"
            color="gray.900"
          >
            Sign In
          </ModalHeader>
          <ModalCloseButton
            borderRadius="lg"
            _focus={{
              boxShadow: '0 0 0 2px rgba(244, 63, 94, 0.5)',
            }}
          />
          <ModalBody pb={6}>
            {/* Your form content */}
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              bgGradient="linear(to-r, primary.500, primary.400)"
              color="white"
            >
              Sign In
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
```

### Card Component

Use Chakra UI Box/Card for content containers:

```tsx
import { Box, Card, CardHeader, CardBody, CardFooter, Heading, Text } from '@chakra-ui/react';

// Basic card
<Card
  bg="white"
  borderRadius="28px"
  p={8}
  shadow="card"
  border="1px solid"
  borderColor="rgba(244, 63, 94, 0.08)"
  transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
  _hover={{
    shadow: 'cardHover',
    transform: 'translateY(-4px)',
  }}
>
  <CardBody>
    <Heading size="md" fontFamily="heading" color="gray.900">
      Card Title
    </Heading>
    <Text mt={4} color="gray.700">
      Card content goes here
    </Text>
  </CardBody>
</Card>

// Elevated card
<Card
  bg="white"
  borderRadius="28px"
  p={10}
  shadow="lg"
  border="1px solid"
  borderColor="rgba(244, 63, 94, 0.06)"
>
  <CardBody>
    <Heading size="lg">Premium Content</Heading>
    <Text mt={4}>More prominent card style</Text>
  </CardBody>
</Card>

// Glass morphism card
<Card
  bg="rgba(255, 255, 255, 0.75)"
  backdropFilter="blur(24px)"
  borderRadius="28px"
  p={8}
  border="1px solid"
  borderColor="rgba(255, 255, 255, 0.4)"
  shadow="glass"
>
  <CardBody>
    <Heading size="md">Glass Card</Heading>
    <Text mt={4}>Semi-transparent with blur</Text>
  </CardBody>
</Card>

// Premium gradient card
<Card
  bgGradient="linear(145deg, white 0%, primary.50 100%)"
  borderRadius="28px"
  p={8}
  border="1px solid"
  borderColor="rgba(244, 63, 94, 0.12)"
  shadow="premium"
>
  <CardBody>
    <Heading size="md">Premium Feature</Heading>
    <Text mt={4}>Subtle gradient background</Text>
  </CardBody>
</Card>

// Clickable card
<Card
  as="button"
  onClick={handleClick}
  cursor="pointer"
  bg="white"
  borderRadius="28px"
  p={8}
  shadow="card"
  transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
  _hover={{
    shadow: 'cardHover',
    transform: 'translateY(-4px)',
  }}
  _active={{
    transform: 'scale(0.98)',
  }}
>
  <CardBody>
    <Text>Click me!</Text>
  </CardBody>
</Card>
```

### Avatar Component

Use Chakra UI Avatar:

```tsx
import { Avatar, AvatarBadge, AvatarGroup } from '@chakra-ui/react';

// Basic avatar
<Avatar
  name="John Doe"
  src="/path/to/avatar.jpg"
  size="lg"
  bg="primary.500"
/>

// With online badge
<Avatar name="Jane Smith" src="/avatar.jpg">
  <AvatarBadge
    boxSize="1.25em"
    bg="green.500"
    border="2px solid white"
  />
</Avatar>

// Avatar group
<AvatarGroup size="md" max={3}>
  <Avatar name="User 1" src="/avatar1.jpg" />
  <Avatar name="User 2" src="/avatar2.jpg" />
  <Avatar name="User 3" src="/avatar3.jpg" />
  <Avatar name="User 4" src="/avatar4.jpg" />
  <Avatar name="User 5" src="/avatar5.jpg" />
</AvatarGroup>
```

## Integration with TanStack Form

Combine Chakra UI with TanStack Form:

```tsx
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  VStack,
} from '@chakra-ui/react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function LoginForm() {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      // Handle login
      await login(value);
    },
    validatorAdapter: zodValidator,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <VStack spacing={6} align="stretch">
        <form.Field
          name="email"
          validators={{
            onChange: loginSchema.shape.email,
          }}
        >
          {(field) => (
            <FormControl isInvalid={!!field.state.meta.errors.length}>
              <FormLabel htmlFor={field.name}>Email</FormLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                type="email"
                placeholder="you@example.com"
                focusBorderColor="primary.500"
                borderRadius="xl"
                borderWidth="2px"
              />
              {field.state.meta.errors.length > 0 && (
                <FormErrorMessage>
                  {field.state.meta.errors[0]}
                </FormErrorMessage>
              )}
            </FormControl>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: loginSchema.shape.password,
          }}
        >
          {(field) => (
            <FormControl isInvalid={!!field.state.meta.errors.length}>
              <FormLabel htmlFor={field.name}>Password</FormLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                type="password"
                placeholder="••••••••"
                focusBorderColor="primary.500"
                borderRadius="xl"
                borderWidth="2px"
              />
              {field.state.meta.errors.length > 0 && (
                <FormErrorMessage>
                  {field.state.meta.errors[0]}
                </FormErrorMessage>
              )}
            </FormControl>
          )}
        </form.Field>

        <Button
          type="submit"
          isLoading={form.state.isSubmitting}
          bgGradient="linear(to-r, primary.500, primary.400)"
          color="white"
          borderRadius="full"
          fontWeight="semibold"
          size="lg"
          shadow="button"
          _hover={{
            transform: 'translateY(-2px) scale(1.02)',
            shadow: 'buttonHover',
          }}
        >
          Sign In
        </Button>
      </VStack>
    </form>
  );
}
```

## Testing Chakra UI Components

Test Chakra UI components with React Testing Library:

```tsx
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { LoginForm } from './LoginForm';

// Helper to wrap with ChakraProvider
function renderWithChakra(ui: React.ReactElement) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

describe('LoginForm', () => {
  it('renders form fields', () => {
    renderWithChakra(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows validation errors', async () => {
    renderWithChakra(<LoginForm />);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('applies romantic theme colors', () => {
    renderWithChakra(<LoginForm />);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Check if gradient is applied
    expect(submitButton).toHaveStyle({
      background: expect.stringContaining('linear-gradient'),
    });
  });
});
```

## Layout Components

### Stack and Flex

```tsx
import { VStack, HStack, Stack, Flex, Spacer } from '@chakra-ui/react';

// Vertical stack
<VStack spacing={6} align="stretch">
  <Box>Item 1</Box>
  <Box>Item 2</Box>
  <Box>Item 3</Box>
</VStack>

// Horizontal stack
<HStack spacing={4}>
  <Button>Cancel</Button>
  <Button>Submit</Button>
</HStack>

// Responsive stack (vertical on mobile, horizontal on desktop)
<Stack direction={['column', 'row']} spacing={4}>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Stack>

// Flex with spacer
<Flex>
  <Box>Left content</Box>
  <Spacer />
  <Box>Right content</Box>
</Flex>
```

### Grid

```tsx
import { Grid, GridItem } from '@chakra-ui/react';

<Grid
  templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
  gap={6}
>
  <GridItem>
    <Card>Card 1</Card>
  </GridItem>
  <GridItem>
    <Card>Card 2</Card>
  </GridItem>
  <GridItem>
    <Card>Card 3</Card>
  </GridItem>
</Grid>
```

## Responsive Design

Use Chakra's responsive array syntax:

```tsx
// Responsive sizes
<Box
  fontSize={['sm', 'md', 'lg', 'xl']}  // xs, sm, md, lg+
  p={[4, 6, 8, 10]}                     // padding scales
  width={['100%', '80%', '60%', '50%']} // width scales
>
  Responsive content
</Box>

// Responsive display
<Box
  display={['none', 'block']}  // Hidden on mobile, visible on sm+
>
  Desktop only content
</Box>

// Responsive direction
<Stack
  direction={['column', 'row']}  // Vertical on mobile, horizontal on sm+
  spacing={[4, 8]}                // Closer spacing on mobile
>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Stack>
```

## Animation and Transitions

```tsx
import { Box, Fade, ScaleFade, Slide, SlideFade } from '@chakra-ui/react';

// Fade in
<Fade in={isOpen}>
  <Box>Faded content</Box>
</Fade>

// Scale fade
<ScaleFade initialScale={0.9} in={isOpen}>
  <Box>Scaled content</Box>
</ScaleFade>

// Slide from direction
<Slide direction="bottom" in={isOpen}>
  <Box>Sliding drawer</Box>
</Slide>

// Manual transitions
<Box
  transition="all 0.3s ease-in-out"
  _hover={{
    transform: 'translateY(-4px)',
    shadow: 'lg',
  }}
>
  Hover me
</Box>
```

## Best Practices

1. **Always wrap with ChakraProvider**: Ensure your app root is wrapped with ChakraProvider and the custom theme
2. **Use theme tokens**: Reference colors, spacing, etc. from theme (e.g., `color="primary.500"` instead of `color="#f43f5e"`)
3. **Leverage responsive props**: Use array syntax for responsive designs
4. **Compose with Box**: Use Box as base component for custom styling
5. **Style props over CSS**: Prefer Chakra's style props over custom CSS
6. **Test with ChakraProvider**: Always wrap test renders with ChakraProvider
7. **Accessibility first**: Chakra UI has excellent a11y defaults, maintain them

## Common Patterns

### Form with TanStack Form
- Use `form.Field` components with Chakra's FormControl
- Show errors with FormErrorMessage when `field.state.meta.errors.length > 0`
- Use `isInvalid` prop on FormControl

### Loading States
- Use `isLoading` prop on Button
- Use `Skeleton` for content loading
- Use `Spinner` for inline loading indicators

### Modals and Drawers
- Use `useDisclosure` hook for open/close state
- Use ModalOverlay with backdrop blur for romantic feel
- Set `motionPreset="slideInBottom"` for smooth animations

### Cards and Lists
- Use hover effects with `_hover` prop
- Add shadows with `shadow` prop from theme
- Use `borderRadius="28px"` for romantic rounded corners
- Add transitions for smooth interactions

## Next Steps

1. Update existing CSS Modules components to use Chakra UI
2. Create reusable wrapper components if needed (e.g., `PrimaryButton` that wraps Chakra Button with romantic styling)
3. Build auth modal with Chakra UI + TanStack Form
4. Implement protected routes with Chakra UI feedback components
5. Build profile pages with Chakra UI layout components
