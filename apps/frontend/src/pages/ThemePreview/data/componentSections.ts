/**
 * Component sections for theme preview
 * Organized list of all Chakra UI components to showcase
 */

export interface ComponentSection {
  id: string;
  label: string;
  category: string;
}

export const componentSections: ComponentSection[] = [
  // Typography
  { id: 'typography', label: 'Typography', category: 'Typography' },
  { id: 'headings', label: 'Headings', category: 'Typography' },
  { id: 'text', label: 'Text & Paragraphs', category: 'Typography' },

  // Buttons & Actions
  { id: 'buttons', label: 'Buttons', category: 'Actions' },
  { id: 'icon-buttons', label: 'Icon Buttons', category: 'Actions' },

  // Forms
  { id: 'inputs', label: 'Input Fields', category: 'Forms' },
  { id: 'textarea', label: 'Textarea', category: 'Forms' },
  { id: 'select', label: 'Select', category: 'Forms' },
  { id: 'checkbox', label: 'Checkbox', category: 'Forms' },
  { id: 'radio', label: 'Radio', category: 'Forms' },
  { id: 'switch', label: 'Switch', category: 'Forms' },

  // Layout
  { id: 'box', label: 'Box & Container', category: 'Layout' },
  { id: 'stack', label: 'Stack & Flex', category: 'Layout' },
  { id: 'grid', label: 'Grid', category: 'Layout' },

  // Feedback
  { id: 'alerts', label: 'Alerts', category: 'Feedback' },
  { id: 'toasts', label: 'Toasts', category: 'Feedback' },
  { id: 'progress', label: 'Progress', category: 'Feedback' },
  { id: 'spinner', label: 'Spinner', category: 'Feedback' },

  // Overlay
  { id: 'modal', label: 'Modal', category: 'Overlay' },
  { id: 'drawer', label: 'Drawer', category: 'Overlay' },
  { id: 'popover', label: 'Popover', category: 'Overlay' },
  { id: 'tooltip', label: 'Tooltip', category: 'Overlay' },

  // Data Display
  { id: 'card', label: 'Card', category: 'Data Display' },
  { id: 'badge', label: 'Badge', category: 'Data Display' },
  { id: 'tag', label: 'Tag', category: 'Data Display' },
  { id: 'avatar', label: 'Avatar', category: 'Data Display' },

  // Navigation
  { id: 'tabs', label: 'Tabs', category: 'Navigation' },
  { id: 'breadcrumb', label: 'Breadcrumb', category: 'Navigation' },
];

export const getComponentsByCategory = () => {
  const categories = Array.from(
    new Set(componentSections.map((section) => section.category))
  );

  return categories.map((category) => ({
    category,
    components: componentSections.filter((section) => section.category === category),
  }));
};
