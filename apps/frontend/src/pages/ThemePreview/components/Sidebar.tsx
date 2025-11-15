/**
 * Sidebar Component
 * Left navigation menu for theme component preview
 */

import { Box, VStack, Text, Heading } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { ComponentSection, getComponentsByCategory } from '../data/componentSections';

interface SidebarProps {
  sections: ComponentSection[];
  selectedComponent: string;
  onSelectComponent: (componentId: string) => void;
}

export const Sidebar = ({ selectedComponent, onSelectComponent }: SidebarProps) => {
  const categorizedComponents = getComponentsByCategory();

  return (
    <Box
      w="280px"
      bg="bg.surface"
      borderRightWidth="1px"
      borderColor="border"
      overflowY="auto"
      h="100vh"
      position="sticky"
      top={0}
    >
      <VStack align="stretch" gap={0}>
        {/* Header */}
        <Box p={6} borderBottomWidth="1px" borderColor="border">
          <Link to="/">
            <Heading
              size="md"
              bgGradient="linear(to-r, brand.500, rose.500)"
              bgClip="text"
              cursor="pointer"
              _hover={{ opacity: 0.8 }}
            >
              Datifyy Theme
            </Heading>
          </Link>
          <Text fontSize="sm" color="fg.muted" mt={1}>
            Component Preview
          </Text>
        </Box>

        {/* Navigation */}
        <VStack align="stretch" gap={0} p={4}>
          {categorizedComponents.map(({ category, components }) => (
            <Box key={category} mb={4}>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color="fg.subtle"
                textTransform="uppercase"
                letterSpacing="wide"
                px={3}
                py={2}
              >
                {category}
              </Text>
              <VStack align="stretch" gap={1}>
                {components.map((component) => (
                  <Box
                    key={component.id}
                    px={3}
                    py={2}
                    borderRadius="md"
                    cursor="pointer"
                    bg={selectedComponent === component.id ? 'brand.50' : 'transparent'}
                    color={selectedComponent === component.id ? 'brand.700' : 'fg'}
                    fontWeight={selectedComponent === component.id ? 'semibold' : 'normal'}
                    _hover={{
                      bg: selectedComponent === component.id ? 'brand.50' : 'bg.muted',
                    }}
                    onClick={() => onSelectComponent(component.id)}
                    transition="all 0.2s"
                  >
                    <Text fontSize="sm">{component.label}</Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};
