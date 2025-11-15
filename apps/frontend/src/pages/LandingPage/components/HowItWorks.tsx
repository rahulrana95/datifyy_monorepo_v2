/**
 * How It Works Section
 */

import { Box, Heading, Text, VStack, HStack, Flex } from '@chakra-ui/react';

const steps = [
  {
    step: '1',
    title: 'Sign Up & Get Verified',
    description: 'Create your profile and complete verification through government ID or work email.',
  },
  {
    step: '2',
    title: 'Set Your Preferences',
    description: 'Tell us what matters to you - from lifestyle to values to deal-breakers.',
  },
  {
    step: '3',
    title: 'Get Matched',
    description: 'Our matchmakers curate perfect matches based on deep compatibility.',
  },
  {
    step: '4',
    title: 'Connect & Date',
    description: 'Chat securely, schedule dates, and build meaningful relationships.',
  },
];

export const HowItWorks = () => {
  return (
    <Box as="section" py={{ base: 16, md: 20 }} px={4} bg="brand.50">
      <VStack gap={12} maxW="1000px" mx="auto">
        <VStack gap={4} textAlign="center">
          <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }} fontWeight="bold" color="fg">
            How It Works
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color="fg.muted" maxW="600px">
            Four simple steps to finding your perfect match
          </Text>
        </VStack>

        <Flex direction="column" gap={8} w="full">
          {steps.map((item, index) => (
            <HStack
              key={index}
              align="start"
              gap={6}
              p={6}
              bg="white"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="border"
              _hover={{ boxShadow: 'lg', transform: 'translateX(8px)' }}
              transition="all 0.3s"
            >
              <Box
                fontSize="2xl"
                fontWeight="bold"
                color="white"
                bg="brand.500"
                w="14"
                h="14"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="full"
                flexShrink={0}
              >
                {item.step}
              </Box>
              <VStack align="start" gap={2}>
                <Heading size="md" color="fg">
                  {item.title}
                </Heading>
                <Text color="fg.muted">{item.description}</Text>
              </VStack>
            </HStack>
          ))}
        </Flex>
      </VStack>
    </Box>
  );
};
