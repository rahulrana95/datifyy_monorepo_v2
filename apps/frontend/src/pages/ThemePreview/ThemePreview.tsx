/**
 * Theme Preview Page
 * Showcases all Chakra UI components with the Datifyy theme
 */

import { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Sidebar } from './components/Sidebar';
import { ComponentPreview } from './components/ComponentPreview';
import { componentSections } from './data/componentSections';

export const ThemePreview = () => {
  const [selectedComponent, setSelectedComponent] = useState(componentSections[0].id);

  return (
    <Flex minH="100vh" bg="bg">
      {/* Left Sidebar */}
      <Sidebar
        sections={componentSections}
        selectedComponent={selectedComponent}
        onSelectComponent={setSelectedComponent}
      />

      {/* Main Content */}
      <Box flex="1" p={8} overflowY="auto">
        <ComponentPreview componentId={selectedComponent} />
      </Box>
    </Flex>
  );
};
