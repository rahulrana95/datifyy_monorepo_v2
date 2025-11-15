/**
 * Logo Component
 * Datifyy brand logo with gradient
 */

import { Heading } from '@chakra-ui/react';

export const Logo = () => {
  return (
    <Heading
      size="lg"
      bgGradient="linear(to-r, brand.500, rose.500)"
      bgClip="text"
      fontWeight="black"
      letterSpacing="tight"
      cursor="pointer"
      _hover={{ opacity: 0.8 }}
      transition="opacity 0.2s"
    >
      Datifyy
    </Heading>
  );
};
