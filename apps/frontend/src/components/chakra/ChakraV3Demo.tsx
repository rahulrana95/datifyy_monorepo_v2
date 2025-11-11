/**
 * Chakra UI v3 + Emotion Demo
 * Compatible with Chakra UI v3
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Stack,
  Badge,
  Code,
  Input,
  Textarea,
  Container,
  IconButton,
} from '@chakra-ui/react';
import styled from '@emotion/styled';
import '../../styles/animations.css';

// Emotion styled component
const GradientHeading = styled(Heading)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 3rem;
  font-weight: bold;
`;

// Custom button with Emotion
const CustomButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    background: linear-gradient(135deg, #5a67d8 0%, #6b4a8e 100%);
  }
`;

// Glass effect card
const GlassCard = styled(Card.Root)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
`;

export const ChakraV3Demo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basics' | 'emotion' | 'advanced'>('basics');

  return (
    <Container maxW="1200px" py={8}>
      <VStack gap={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <GradientHeading>Chakra UI v3 + Emotion</GradientHeading>
          <Text fontSize="lg" color="gray.600" mt={4}>
            Modern styling with Chakra v3 and Emotion CSS-in-JS
          </Text>
        </Box>

        {/* Tab Navigation */}
        <HStack gap={2} justify="center">
          <Button
            variant={activeTab === 'basics' ? 'solid' : 'outline'}
            onClick={() => setActiveTab('basics')}
          >
            Basics
          </Button>
          <Button
            variant={activeTab === 'emotion' ? 'solid' : 'outline'}
            onClick={() => setActiveTab('emotion')}
          >
            Emotion Styling
          </Button>
          <Button
            variant={activeTab === 'advanced' ? 'solid' : 'outline'}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </Button>
        </HStack>

        {/* Content */}
        <Box minH="400px">
          {/* Basics Tab */}
          {activeTab === 'basics' && (
            <Stack gap={6}>
              <Card.Root>
                <Card.Header>
                  <Heading size="md">Chakra UI v3 Components</Heading>
                </Card.Header>
                <Card.Body>
                  <Stack gap={4}>
                    <Text>
                      Chakra UI v3 provides a modern component library with built-in styling.
                    </Text>
                    
                    <HStack gap={3}>
                      <Button>Primary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="subtle">Subtle</Button>
                    </HStack>

                    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                      <Card.Root>
                        <Card.Body>
                          <Badge>New</Badge>
                          <Heading size="sm" mt={2}>Feature 1</Heading>
                          <Text fontSize="sm" color="gray.600">
                            Built-in components
                          </Text>
                        </Card.Body>
                      </Card.Root>

                      <Card.Root>
                        <Card.Body>
                          <Badge>Active</Badge>
                          <Heading size="sm" mt={2}>Feature 2</Heading>
                          <Text fontSize="sm" color="gray.600">
                            Responsive design
                          </Text>
                        </Card.Body>
                      </Card.Root>

                      <Card.Root>
                        <Card.Body>
                          <Badge>Beta</Badge>
                          <Heading size="sm" mt={2}>Feature 3</Heading>
                          <Text fontSize="sm" color="gray.600">
                            Dark mode ready
                          </Text>
                        </Card.Body>
                      </Card.Root>
                    </Grid>

                    <Box>
                      <Text fontWeight="semibold" mb={2}>Form Elements:</Text>
                      <Stack gap={3}>
                        <Input placeholder="Enter your name" />
                        <Textarea placeholder="Enter your message" />
                      </Stack>
                    </Box>
                  </Stack>
                </Card.Body>
              </Card.Root>
            </Stack>
          )}

          {/* Emotion Styling Tab */}
          {activeTab === 'emotion' && (
            <Stack gap={6}>
              <Card.Root>
                <Card.Header>
                  <Heading size="md">Emotion CSS-in-JS</Heading>
                </Card.Header>
                <Card.Body>
                  <Stack gap={6}>
                    <Box>
                      <Text fontWeight="semibold" mb={3}>Styled Components:</Text>
                      <VStack gap={4} align="start">
                        <CustomButton>Gradient Button with Emotion</CustomButton>
                        
                        <Code display="block" p={4} borderRadius="md" whiteSpace="pre">
{`const CustomButton = styled(Button)\`
  background: linear-gradient(135deg, #667eea, #764ba2);
  &:hover {
    transform: translateY(-2px);
  }
\`;`}
                        </Code>
                      </VStack>
                    </Box>

                    <Box>
                      <Text fontWeight="semibold" mb={3}>Inline Styles:</Text>
                      <Box
                        p={6}
                        borderRadius="12px"
                        color="white"
                        fontWeight="600"
                        style={{
                          background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)'
                        }}
                      >
                        Box styled with inline styles
                      </Box>
                    </Box>

                    <Box>
                      <Text fontWeight="semibold" mb={3}>Animated Elements:</Text>
                      <HStack gap={4}>
                        <Box
                          w="100px"
                          h="100px"
                          bg="purple.500"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          fontWeight="bold"
                          style={{
                            animation: 'pulse 2s infinite'
                          }}
                        >
                          Pulse
                        </Box>

                        <Box
                          w="100px"
                          h="100px"
                          bg="blue.500"
                          borderRadius="lg"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          fontWeight="bold"
                          style={{
                            animation: 'rotate 3s linear infinite'
                          }}
                        >
                          Spin
                        </Box>
                      </HStack>
                    </Box>
                  </Stack>
                </Card.Body>
              </Card.Root>
            </Stack>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <Stack gap={6}>
              <GlassCard>
                <Heading size="md" mb={4}>Glass Morphism Card</Heading>
                <Text>
                  This card uses styled-components with glass effect styling.
                </Text>
                <Code mt={3} display="block" p={3}>
                  backdrop-filter: blur(10px)
                </Code>
              </GlassCard>

              <Card.Root>
                <Card.Header>
                  <Heading size="md">Complex Layouts</Heading>
                </Card.Header>
                <Card.Body>
                  <Grid
                    templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
                    gap={4}
                  >
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <Box
                        key={item}
                        p={4}
                        borderWidth="1px"
                        borderRadius="lg"
                        _hover={{
                          transform: 'translateY(-4px)',
                          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                          borderColor: '#667eea'
                        }}
                        transition="all 0.3s ease"
                      >
                        <Heading size="sm">Item {item}</Heading>
                        <Text fontSize="sm" color="gray.600" mt={2}>
                          Hover effect with Emotion
                        </Text>
                      </Box>
                    ))}
                  </Grid>
                </Card.Body>
              </Card.Root>

              <Card.Root>
                <Card.Header>
                  <Heading size="md">Best Practices</Heading>
                </Card.Header>
                <Card.Body>
                  <Stack gap={3}>
                    <Box>
                      <Badge colorPalette="green" mb={2}>Recommended</Badge>
                      <Text>✅ Use Chakra components for basic styling</Text>
                    </Box>
                    <Box>
                      <Badge colorPalette="blue" mb={2}>Advanced</Badge>
                      <Text>✅ Use Emotion for complex animations and effects</Text>
                    </Box>
                    <Box>
                      <Badge colorPalette="purple" mb={2}>Performance</Badge>
                      <Text>✅ Leverage CSS-in-JS for dynamic styling</Text>
                    </Box>
                  </Stack>
                </Card.Body>
              </Card.Root>
            </Stack>
          )}
        </Box>
      </VStack>
    </Container>
  );
};