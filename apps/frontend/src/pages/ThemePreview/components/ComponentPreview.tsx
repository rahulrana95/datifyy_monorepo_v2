/**
 * Component Preview
 * Displays examples of selected Chakra UI component with theme
 */

import { Box, Heading, VStack } from '@chakra-ui/react';
import { TypographyPreview } from './previews/TypographyPreview';
import { HeadingsPreview } from './previews/HeadingsPreview';
import { TextPreview } from './previews/TextPreview';
import { ButtonsPreview } from './previews/ButtonsPreview';
import { IconButtonsPreview } from './previews/IconButtonsPreview';
import { InputsPreview } from './previews/InputsPreview';
import { TextareaPreview } from './previews/TextareaPreview';
import { SelectPreview } from './previews/SelectPreview';
import { CheckboxPreview } from './previews/CheckboxPreview';
import { RadioPreview } from './previews/RadioPreview';
import { SwitchPreview } from './previews/SwitchPreview';
import { BoxPreview } from './previews/BoxPreview';
import { StackPreview } from './previews/StackPreview';
import { GridPreview } from './previews/GridPreview';
import { AlertsPreview } from './previews/AlertsPreview';
import { ProgressPreview } from './previews/ProgressPreview';
import { SpinnerPreview } from './previews/SpinnerPreview';
import { ModalPreview } from './previews/ModalPreview';
import { TooltipPreview } from './previews/TooltipPreview';
import { CardPreview } from './previews/CardPreview';
import { BadgePreview } from './previews/BadgePreview';
import { AvatarPreview } from './previews/AvatarPreview';

interface ComponentPreviewProps {
  componentId: string;
}

const componentMap: Record<string, { title: string; component: React.ReactNode }> = {
  typography: { title: 'Typography', component: <TypographyPreview /> },
  headings: { title: 'Headings', component: <HeadingsPreview /> },
  text: { title: 'Text & Paragraphs', component: <TextPreview /> },
  buttons: { title: 'Buttons', component: <ButtonsPreview /> },
  'icon-buttons': { title: 'Icon Buttons', component: <IconButtonsPreview /> },
  inputs: { title: 'Input Fields', component: <InputsPreview /> },
  textarea: { title: 'Textarea', component: <TextareaPreview /> },
  select: { title: 'Select', component: <SelectPreview /> },
  checkbox: { title: 'Checkbox', component: <CheckboxPreview /> },
  radio: { title: 'Radio', component: <RadioPreview /> },
  switch: { title: 'Switch', component: <SwitchPreview /> },
  box: { title: 'Box & Container', component: <BoxPreview /> },
  stack: { title: 'Stack & Flex', component: <StackPreview /> },
  grid: { title: 'Grid', component: <GridPreview /> },
  alerts: { title: 'Alerts', component: <AlertsPreview /> },
  progress: { title: 'Progress', component: <ProgressPreview /> },
  spinner: { title: 'Spinner', component: <SpinnerPreview /> },
  modal: { title: 'Modal', component: <ModalPreview /> },
  tooltip: { title: 'Tooltip', component: <TooltipPreview /> },
  card: { title: 'Card', component: <CardPreview /> },
  badge: { title: 'Badge', component: <BadgePreview /> },
  avatar: { title: 'Avatar', component: <AvatarPreview /> },
};

export const ComponentPreview = ({ componentId }: ComponentPreviewProps) => {
  const preview = componentMap[componentId];

  if (!preview) {
    return (
      <Box>
        <Heading size="lg" mb={6}>
          Component Not Found
        </Heading>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <Heading size="lg" color="fg">
        {preview.title}
      </Heading>
      <Box>{preview.component}</Box>
    </VStack>
  );
};
