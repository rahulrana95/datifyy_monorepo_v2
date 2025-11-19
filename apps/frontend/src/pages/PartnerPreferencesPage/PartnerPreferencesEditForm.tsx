/**
 * Partner Preferences Edit Form
 * Form for editing partner preferences with organized collapsible sections
 */

import {
  Box,
  Button,
  HStack,
  VStack,
  SimpleGrid,
  Heading,
  Text,
  Input,
  NativeSelect,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { useState, useCallback, useMemo } from 'react';
import type { PartnerPreferences } from '../../gen/user/v1/user_pb';

export interface PartnerPreferencesEditFormProps {
  preferences: PartnerPreferences;
  onSave: (updates: PartnerPreferences) => Promise<void>;
  onCancel: () => void;
}

// Chevron icon component
const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <Icon viewBox="0 0 24 24" boxSize={5} transition="transform 0.2s">
    <path
      fill="currentColor"
      d={isOpen ? "M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" : "M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"}
    />
  </Icon>
);

// Field label component - moved outside to prevent re-creation
const FieldLabel = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <Text fontSize="sm" color="fg.muted" mb={1}>{children}</Text>
);

// Custom checkbox component - moved outside to prevent re-creation
const FormCheckbox = ({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}): JSX.Element => (
  <HStack as="label" cursor="pointer" gap={2} py={1}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => {
        e.stopPropagation();
        onChange(e.target.checked);
      }}
      style={{
        width: '16px',
        height: '16px',
        accentColor: 'var(--chakra-colors-brand-500)',
        cursor: 'pointer'
      }}
    />
    <Text fontSize="sm" color="fg">{label}</Text>
  </HStack>
);

// Collapsible section component - moved outside to prevent re-creation
const CollapsibleSection = ({
  id,
  title,
  subtitle,
  children,
  icon,
  isExpanded,
  onToggle
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: string;
  isExpanded: boolean;
  onToggle: () => void;
}): JSX.Element => (
  <Box
    bg="white"
    borderRadius="lg"
    borderWidth="1px"
    borderColor="gray.200"
    overflow="hidden"
    mb={3}
  >
    <Box
      as="button"
      w="100%"
      p={4}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      bg={isExpanded ? 'brand.50' : 'white'}
      _hover={{ bg: 'gray.50' }}
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        onToggle();
      }}
      transition="background 0.2s"
    >
      <HStack gap={3}>
        {icon && <Text fontSize="xl">{icon}</Text>}
        <Box textAlign="left">
          <Text fontWeight="semibold" color="fg">{title}</Text>
          {subtitle && <Text fontSize="xs" color="fg.muted">{subtitle}</Text>}
        </Box>
      </HStack>
      <ChevronIcon isOpen={isExpanded} />
    </Box>
    {isExpanded && (
      <Box p={4} pt={2} borderTopWidth="1px" borderColor="gray.100">
        {children}
      </Box>
    )}
  </Box>
);

// Multi-select checkbox group for enums - moved outside to prevent re-creation
const EnumCheckboxGroup = ({
  values,
  options,
  onToggle
}: {
  values: number[];
  options: { value: number; label: string }[];
  onToggle: (value: number) => void;
}): JSX.Element => (
  <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={1}>
    {options.map(option => (
      <FormCheckbox
        key={option.value}
        checked={values.includes(option.value)}
        onChange={() => onToggle(option.value)}
        label={option.label}
      />
    ))}
  </SimpleGrid>
);

export const PartnerPreferencesEditForm = ({
  preferences,
  onSave,
  onCancel,
}: PartnerPreferencesEditFormProps): JSX.Element => {
  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    relationship: false,
    education: false,
    religion: false,
    lifestyle: false,
    personality: false,
    physical: false,
    financial: false,
    family: false,
    location: false,
    interests: false,
    requirements: false,
  });

  // Loading and error state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form state - using useMemo to prevent unnecessary re-renders
  const initialState = useMemo(() => ({
    // Basic Preferences
    minAge: preferences.ageRange?.minAge || 18,
    maxAge: preferences.ageRange?.maxAge || 99,
    distancePreference: preferences.distancePreference || 50,
    minHeight: preferences.heightRange?.minHeight || 150,
    maxHeight: preferences.heightRange?.maxHeight || 200,
    verifiedOnly: preferences.verifiedOnly || false,
    lookingForMale: preferences.lookingForGender?.includes(1) || false,
    lookingForFemale: preferences.lookingForGender?.includes(2) || false,
    lookingForNonBinary: preferences.lookingForGender?.includes(3) || false,

    // Relationship Goals
    relationshipGoals: preferences.relationshipGoals || [],

    // Education & Career
    educationLevels: preferences.educationLevels || [],
    occupations: preferences.occupations || [],
    minYearsExperience: preferences.minYearsExperience || 0,
    industryPreferences: preferences.industryPreferences?.join(', ') || '',

    // Religion & Culture
    religions: preferences.religions || [],
    religionImportance: preferences.religionImportance || 0,
    castePreferences: preferences.castePreferences?.join(', ') || '',
    subCastePreferences: preferences.subCastePreferences?.join(', ') || '',
    gotraPreferences: preferences.gotraPreferences?.join(', ') || '',
    manglikPreference: preferences.manglikPreference || 0,
    horoscopeMatchingRequired: preferences.horoscopeMatchingRequired || false,

    // Lifestyle
    childrenPreferences: preferences.childrenPreferences || [],
    drinkingPreferences: preferences.drinkingPreferences || [],
    smokingPreferences: preferences.smokingPreferences || [],
    dietaryPreferences: preferences.dietaryPreferences || [],
    petPreferences: preferences.petPreferences || [],
    workoutPreferences: preferences.workoutPreferences || [],

    // Personality & Communication
    personalityTypes: preferences.personalityTypes?.join(', ') || '',
    communicationStyles: preferences.communicationStyles || [],
    loveLanguages: preferences.loveLanguages || [],
    politicalViews: preferences.politicalViews || [],
    sleepSchedules: preferences.sleepSchedules || [],

    // Physical
    bodyTypePreferences: preferences.bodyTypePreferences || [],
    complexionPreferences: preferences.complexionPreferences || [],
    hairColorPreferences: preferences.hairColorPreferences || [],
    eyeColorPreferences: preferences.eyeColorPreferences || [],
    facialHairPreferences: preferences.facialHairPreferences || [],
    tattooPreference: preferences.tattooPreference || 0,
    piercingPreference: preferences.piercingPreference || 0,

    // Financial
    incomePreferences: preferences.incomePreferences || [],
    employmentPreferences: preferences.employmentPreferences || [],
    propertyPreference: preferences.propertyPreference || 0,
    vehiclePreference: preferences.vehiclePreference || 0,
    financialExpectation: preferences.financialExpectation || 0,

    // Family
    familyTypePreferences: preferences.familyTypePreferences || [],
    familyValuesPreferences: preferences.familyValuesPreferences || [],
    livingSituationPreferences: preferences.livingSituationPreferences || [],
    familyAffluencePreferences: preferences.familyAffluencePreferences || [],
    maxSiblings: preferences.maxSiblings || 0,
    familyLocationPreferences: preferences.familyLocationPreferences?.join(', ') || '',

    // Location & Language
    locationPreferences: preferences.locationPreferences?.join(', ') || '',
    openToLongDistance: preferences.openToLongDistance || false,
    nriPreference: preferences.nriPreference || 0,
    relocationExpectation: preferences.relocationExpectation || 0,
    languagePreferences: preferences.languagePreferences || [],
    minLanguageProficiency: preferences.minLanguageProficiency || 0,
    motherTonguePreferences: preferences.motherTonguePreferences?.join(', ') || '',
    nationalityPreferences: preferences.nationalityPreferences?.join(', ') || '',
    ethnicityPreferences: preferences.ethnicityPreferences || [],

    // Interests
    interestPreferences: preferences.interestPreferences || [],
    minSharedInterests: preferences.minSharedInterests || 0,

    // Accessibility
    disabilityAcceptance: preferences.disabilityAcceptance || 0,

    // Requirements
    maxDaysInactive: preferences.maxDaysInactive || 30,
    photosRequired: preferences.photosRequired || false,
    minProfileCompletion: preferences.minProfileCompletion || 0,
    customDealbreakers: preferences.customDealbreakers?.join(', ') || '',
    dealBreakersInput: preferences.dealBreakers?.map(d => `${d.type}:${d.description}:${d.priority}`).join(', ') || '',
    mustHavesInput: preferences.mustHaves?.map(m => `${m.type}:${m.description}:${m.priority}`).join(', ') || '',
  }), [preferences]);

  const [formData, setFormData] = useState(initialState);

  // Update form field
  const updateField = useCallback(<K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // Helper to toggle enum array value
  const toggleEnumValue = useCallback((
    field: keyof typeof formData,
    value: number
  ) => {
    const currentValues = formData[field] as number[];
    if (currentValues.includes(value)) {
      updateField(field, currentValues.filter(v => v !== value) as any);
    } else {
      updateField(field, [...currentValues, value] as any);
    }
  }, [formData, updateField]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    setIsSaving(true);
    setSaveError(null);

    try {
      const lookingForGender: number[] = [];
      if (formData.lookingForMale) lookingForGender.push(1);
      if (formData.lookingForFemale) lookingForGender.push(2);
      if (formData.lookingForNonBinary) lookingForGender.push(3);

      // Parse deal breakers
      const dealBreakers = formData.dealBreakersInput
        ? formData.dealBreakersInput.split(',').map(item => {
            const parts = item.trim().split(':');
            return {
              type: Number(parts[0]?.trim()) || 0,
              description: parts[1]?.trim() || '',
              priority: Number(parts[2]?.trim()) || 1,
              $typeName: 'datifyy.user.v1.DealBreaker' as const,
            };
          }).filter(d => d.description)
        : [];

      // Parse must haves
      const mustHaves = formData.mustHavesInput
        ? formData.mustHavesInput.split(',').map(item => {
            const parts = item.trim().split(':');
            return {
              type: Number(parts[0]?.trim()) || 0,
              description: parts[1]?.trim() || '',
              priority: Number(parts[2]?.trim()) || 1,
              $typeName: 'datifyy.user.v1.MustHave' as const,
            };
          }).filter(m => m.description)
        : [];

      const updates: PartnerPreferences = {
        ...preferences,
        ageRange: preferences.ageRange
          ? { ...preferences.ageRange, minAge: formData.minAge, maxAge: formData.maxAge }
          : { minAge: formData.minAge, maxAge: formData.maxAge, $typeName: 'datifyy.user.v1.AgeRange' },
        heightRange: preferences.heightRange
          ? { ...preferences.heightRange, minHeight: formData.minHeight, maxHeight: formData.maxHeight }
          : { minHeight: formData.minHeight, maxHeight: formData.maxHeight, $typeName: 'datifyy.user.v1.HeightRange' },
        distancePreference: formData.distancePreference,
        verifiedOnly: formData.verifiedOnly,
        lookingForGender,
        relationshipGoals: formData.relationshipGoals,
        educationLevels: formData.educationLevels,
        occupations: formData.occupations,
        minYearsExperience: formData.minYearsExperience,
        industryPreferences: formData.industryPreferences ? formData.industryPreferences.split(',').map(s => s.trim()).filter(Boolean) : [],
        religions: formData.religions,
        religionImportance: formData.religionImportance,
        castePreferences: formData.castePreferences ? formData.castePreferences.split(',').map(s => s.trim()).filter(Boolean) : [],
        subCastePreferences: formData.subCastePreferences ? formData.subCastePreferences.split(',').map(s => s.trim()).filter(Boolean) : [],
        gotraPreferences: formData.gotraPreferences ? formData.gotraPreferences.split(',').map(s => s.trim()).filter(Boolean) : [],
        manglikPreference: formData.manglikPreference,
        horoscopeMatchingRequired: formData.horoscopeMatchingRequired,
        childrenPreferences: formData.childrenPreferences,
        drinkingPreferences: formData.drinkingPreferences,
        smokingPreferences: formData.smokingPreferences,
        dietaryPreferences: formData.dietaryPreferences,
        petPreferences: formData.petPreferences,
        workoutPreferences: formData.workoutPreferences,
        personalityTypes: formData.personalityTypes ? formData.personalityTypes.split(',').map(s => s.trim()).filter(Boolean) : [],
        communicationStyles: formData.communicationStyles,
        loveLanguages: formData.loveLanguages,
        politicalViews: formData.politicalViews,
        sleepSchedules: formData.sleepSchedules,
        bodyTypePreferences: formData.bodyTypePreferences,
        complexionPreferences: formData.complexionPreferences,
        hairColorPreferences: formData.hairColorPreferences,
        eyeColorPreferences: formData.eyeColorPreferences,
        facialHairPreferences: formData.facialHairPreferences,
        tattooPreference: formData.tattooPreference,
        piercingPreference: formData.piercingPreference,
        incomePreferences: formData.incomePreferences,
        employmentPreferences: formData.employmentPreferences,
        propertyPreference: formData.propertyPreference,
        vehiclePreference: formData.vehiclePreference,
        financialExpectation: formData.financialExpectation,
        familyTypePreferences: formData.familyTypePreferences,
        familyValuesPreferences: formData.familyValuesPreferences,
        livingSituationPreferences: formData.livingSituationPreferences,
        familyAffluencePreferences: formData.familyAffluencePreferences,
        maxSiblings: formData.maxSiblings,
        familyLocationPreferences: formData.familyLocationPreferences ? formData.familyLocationPreferences.split(',').map(s => s.trim()).filter(Boolean) : [],
        locationPreferences: formData.locationPreferences ? formData.locationPreferences.split(',').map(s => s.trim()).filter(Boolean) : [],
        openToLongDistance: formData.openToLongDistance,
        nriPreference: formData.nriPreference,
        relocationExpectation: formData.relocationExpectation,
        languagePreferences: formData.languagePreferences,
        minLanguageProficiency: formData.minLanguageProficiency,
        motherTonguePreferences: formData.motherTonguePreferences ? formData.motherTonguePreferences.split(',').map(s => s.trim()).filter(Boolean) : [],
        nationalityPreferences: formData.nationalityPreferences ? formData.nationalityPreferences.split(',').map(s => s.trim()).filter(Boolean) : [],
        ethnicityPreferences: formData.ethnicityPreferences,
        interestPreferences: formData.interestPreferences,
        minSharedInterests: formData.minSharedInterests,
        disabilityAcceptance: formData.disabilityAcceptance,
        maxDaysInactive: formData.maxDaysInactive,
        photosRequired: formData.photosRequired,
        minProfileCompletion: formData.minProfileCompletion,
        customDealbreakers: formData.customDealbreakers ? formData.customDealbreakers.split(',').map(d => d.trim()).filter(Boolean) : [],
        dealBreakers,
        mustHaves,
      };

      await onSave(updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save preferences';
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };


  // Enum options (keeping them compact)
  const relationshipGoalOptions = [
    { value: 1, label: 'Casual' }, { value: 2, label: 'Serious' },
    { value: 3, label: 'Marriage' }, { value: 4, label: 'Friendship' },
  ];

  const educationLevelOptions = [
    { value: 1, label: 'High School' }, { value: 2, label: 'Associate' },
    { value: 3, label: 'Bachelor' }, { value: 4, label: 'Master' },
    { value: 5, label: 'Doctorate' }, { value: 6, label: 'Professional' },
  ];

  const occupationOptions = [
    { value: 1, label: 'Software' }, { value: 2, label: 'Healthcare' },
    { value: 3, label: 'Finance' }, { value: 4, label: 'Education' },
    { value: 5, label: 'Engineering' }, { value: 6, label: 'Legal' },
    { value: 7, label: 'Marketing' }, { value: 8, label: 'Business' },
  ];

  const religionOptions = [
    { value: 1, label: 'Hindu' }, { value: 2, label: 'Muslim' },
    { value: 3, label: 'Christian' }, { value: 4, label: 'Sikh' },
    { value: 5, label: 'Buddhist' }, { value: 6, label: 'Jain' },
    { value: 7, label: 'Jewish' }, { value: 8, label: 'Other' },
  ];

  const childrenOptions = [
    { value: 1, label: 'Has Children' }, { value: 2, label: 'No Children' },
    { value: 3, label: 'Wants Children' }, { value: 4, label: 'Open' },
  ];

  const drinkingOptions = [
    { value: 1, label: 'Never' }, { value: 2, label: 'Rarely' },
    { value: 3, label: 'Socially' }, { value: 4, label: 'Regularly' },
  ];

  const smokingOptions = [
    { value: 1, label: 'Never' }, { value: 2, label: 'Occasionally' },
    { value: 3, label: 'Regularly' }, { value: 4, label: 'Quitting' },
  ];

  const dietOptions = [
    { value: 1, label: 'Vegetarian' }, { value: 2, label: 'Non-Veg' },
    { value: 3, label: 'Vegan' }, { value: 4, label: 'Eggetarian' },
  ];

  const petOptions = [
    { value: 1, label: 'Dogs' }, { value: 2, label: 'Cats' },
    { value: 3, label: 'Birds' }, { value: 4, label: 'Fish' },
    { value: 5, label: 'Other' }, { value: 6, label: 'None' },
  ];

  const workoutOptions = [
    { value: 1, label: 'Never' }, { value: 2, label: 'Occasionally' },
    { value: 3, label: 'Regularly' }, { value: 4, label: 'Daily' },
  ];

  const communicationOptions = [
    { value: 1, label: 'Direct' }, { value: 2, label: 'Indirect' },
    { value: 3, label: 'Reserved' }, { value: 4, label: 'Expressive' },
  ];

  const loveLanguageOptions = [
    { value: 1, label: 'Words' }, { value: 2, label: 'Acts' },
    { value: 3, label: 'Gifts' }, { value: 4, label: 'Time' },
    { value: 5, label: 'Touch' },
  ];

  const politicalOptions = [
    { value: 1, label: 'Liberal' }, { value: 2, label: 'Conservative' },
    { value: 3, label: 'Moderate' }, { value: 4, label: 'Apolitical' },
  ];

  const sleepOptions = [
    { value: 1, label: 'Early Bird' }, { value: 2, label: 'Night Owl' },
    { value: 3, label: 'Flexible' },
  ];

  const bodyTypeOptions = [
    { value: 1, label: 'Slim' }, { value: 2, label: 'Athletic' },
    { value: 3, label: 'Average' }, { value: 4, label: 'Curvy' },
    { value: 5, label: 'Muscular' },
  ];

  const complexionOptions = [
    { value: 1, label: 'Very Fair' }, { value: 2, label: 'Fair' },
    { value: 3, label: 'Wheatish' }, { value: 4, label: 'Dusky' },
  ];

  const hairColorOptions = [
    { value: 1, label: 'Black' }, { value: 2, label: 'Brown' },
    { value: 3, label: 'Blonde' }, { value: 4, label: 'Red' },
    { value: 5, label: 'Gray' },
  ];

  const eyeColorOptions = [
    { value: 1, label: 'Brown' }, { value: 2, label: 'Black' },
    { value: 3, label: 'Blue' }, { value: 4, label: 'Green' },
    { value: 5, label: 'Hazel' },
  ];

  const incomeOptions = [
    { value: 1, label: '<3 LPA' }, { value: 2, label: '3-6 LPA' },
    { value: 3, label: '6-10 LPA' }, { value: 4, label: '10-20 LPA' },
    { value: 5, label: '20-50 LPA' }, { value: 6, label: '50+ LPA' },
  ];

  const employmentOptions = [
    { value: 1, label: 'Employed' }, { value: 2, label: 'Self-Employed' },
    { value: 3, label: 'Business' }, { value: 4, label: 'Student' },
  ];

  const familyTypeOptions = [
    { value: 1, label: 'Nuclear' }, { value: 2, label: 'Joint' },
    { value: 3, label: 'Extended' },
  ];

  const familyValuesOptions = [
    { value: 1, label: 'Traditional' }, { value: 2, label: 'Moderate' },
    { value: 3, label: 'Liberal' },
  ];

  const livingSituationOptions = [
    { value: 1, label: 'With Family' }, { value: 2, label: 'Alone' },
    { value: 3, label: 'Roommates' }, { value: 4, label: 'Own Home' },
  ];

  const languageOptions = [
    { value: 1, label: 'Hindi' }, { value: 2, label: 'English' },
    { value: 3, label: 'Bengali' }, { value: 4, label: 'Tamil' },
    { value: 5, label: 'Telugu' }, { value: 6, label: 'Marathi' },
    { value: 7, label: 'Gujarati' }, { value: 8, label: 'Punjabi' },
  ];

  const ethnicityOptions = [
    { value: 1, label: 'South Asian' }, { value: 2, label: 'East Asian' },
    { value: 3, label: 'Caucasian' }, { value: 4, label: 'African' },
    { value: 5, label: 'Middle Eastern' }, { value: 6, label: 'Hispanic' },
  ];

  const interestOptions = [
    { value: 1, label: 'Sports' }, { value: 2, label: 'Music' },
    { value: 3, label: 'Movies' }, { value: 4, label: 'Travel' },
    { value: 5, label: 'Reading' }, { value: 6, label: 'Cooking' },
    { value: 7, label: 'Gaming' }, { value: 8, label: 'Fitness' },
  ];

  return (
    <Box position="relative">
      {/* Error Banner */}
      {saveError && (
        <Box
          position="sticky"
          top={0}
          zIndex={10}
          bg="red.600"
          color="white"
          p={3}
          mb={4}
          borderRadius="md"
          boxShadow="md"
        >
          <HStack justify="space-between">
            <Text fontWeight="medium">{saveError}</Text>
            <Button
              size="xs"
              variant="ghost"
              color="white"
              _hover={{ bg: 'red.700' }}
              onClick={() => setSaveError(null)}
            >
              Dismiss
            </Button>
          </HStack>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        {/* Scrollable content area */}
        <Box maxH="calc(100vh - 280px)" overflowY="auto" pb={4}>
          <VStack align="stretch" gap={2}>
            {/* Basic Preferences */}
            <CollapsibleSection id="basic" title="Basic Preferences" subtitle="Age, height, distance" icon="👤" isExpanded={expandedSections.basic} onToggle={() => toggleSection('basic')}>
              <VStack align="stretch" gap={3}>
                <Box>
                  <FieldLabel>Looking For</FieldLabel>
                  <HStack gap={4}>
                    <FormCheckbox checked={formData.lookingForMale} onChange={(v) => updateField('lookingForMale', v)} label="Male" />
                    <FormCheckbox checked={formData.lookingForFemale} onChange={(v) => updateField('lookingForFemale', v)} label="Female" />
                    <FormCheckbox checked={formData.lookingForNonBinary} onChange={(v) => updateField('lookingForNonBinary', v)} label="Non-binary" />
                  </HStack>
                </Box>
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
                  <Box>
                    <FieldLabel>Min Age</FieldLabel>
                    <Input type="number" size="sm" value={formData.minAge} onChange={(e) => updateField('minAge', Number(e.target.value))} min={18} max={99} />
                  </Box>
                  <Box>
                    <FieldLabel>Max Age</FieldLabel>
                    <Input type="number" size="sm" value={formData.maxAge} onChange={(e) => updateField('maxAge', Number(e.target.value))} min={18} max={99} />
                  </Box>
                  <Box>
                    <FieldLabel>Min Height (cm)</FieldLabel>
                    <Input type="number" size="sm" value={formData.minHeight} onChange={(e) => updateField('minHeight', Number(e.target.value))} />
                  </Box>
                  <Box>
                    <FieldLabel>Max Height (cm)</FieldLabel>
                    <Input type="number" size="sm" value={formData.maxHeight} onChange={(e) => updateField('maxHeight', Number(e.target.value))} />
                  </Box>
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box>
                    <FieldLabel>Max Distance (km)</FieldLabel>
                    <Input type="number" size="sm" value={formData.distancePreference} onChange={(e) => updateField('distancePreference', Number(e.target.value))} />
                  </Box>
                  <Box pt={5}>
                    <FormCheckbox checked={formData.verifiedOnly} onChange={(v) => updateField('verifiedOnly', v)} label="Verified profiles only" />
                  </Box>
                </SimpleGrid>
              </VStack>
            </CollapsibleSection>

            {/* Relationship Goals */}
            <CollapsibleSection id="relationship" title="Relationship Goals" subtitle="What are you looking for?" icon="💕" isExpanded={expandedSections.relationship} onToggle={() => toggleSection('relationship')}>
              <EnumCheckboxGroup values={formData.relationshipGoals} options={relationshipGoalOptions} onToggle={(value) => toggleEnumValue('relationshipGoals', value)} />
            </CollapsibleSection>

            {/* Education & Career */}
            <CollapsibleSection id="education" title="Education & Career" subtitle="Education, occupation, experience" icon="🎓" isExpanded={expandedSections.education} onToggle={() => toggleSection('education')}>
              <VStack align="stretch" gap={3}>
                <Box>
                  <FieldLabel>Education Level</FieldLabel>
                  <EnumCheckboxGroup values={formData.educationLevels} options={educationLevelOptions} onToggle={(value) => toggleEnumValue('educationLevels', value)} />
                </Box>
                <Box>
                  <FieldLabel>Occupation</FieldLabel>
                  <EnumCheckboxGroup values={formData.occupations} options={occupationOptions} onToggle={(value) => toggleEnumValue('occupations', value)} />
                </Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box>
                    <FieldLabel>Min Years Experience</FieldLabel>
                    <Input type="number" size="sm" value={formData.minYearsExperience} onChange={(e) => updateField('minYearsExperience', Number(e.target.value))} />
                  </Box>
                  <Box>
                    <FieldLabel>Industries (comma-separated)</FieldLabel>
                    <Input size="sm" value={formData.industryPreferences} onChange={(e) => updateField('industryPreferences', e.target.value)} placeholder="Tech, Finance..." />
                  </Box>
                </SimpleGrid>
              </VStack>
            </CollapsibleSection>

            {/* Religion & Culture */}
            <CollapsibleSection id="religion" title="Religion & Culture" subtitle="Religion, caste, traditions" icon="🙏" isExpanded={expandedSections.religion} onToggle={() => toggleSection('religion')}>
              <VStack align="stretch" gap={3}>
                <Box>
                  <FieldLabel>Religion</FieldLabel>
                  <EnumCheckboxGroup values={formData.religions} options={religionOptions} onToggle={(value) => toggleEnumValue('religions', value)} />
                </Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box>
                    <FieldLabel>Religion Importance</FieldLabel>
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field value={formData.religionImportance} onChange={(e) => updateField('religionImportance', Number(e.target.value))}>
                        <option value={0}>No preference</option>
                        <option value={1}>Not important</option>
                        <option value={2}>Somewhat</option>
                        <option value={3}>Important</option>
                        <option value={4}>Very important</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                  <Box>
                    <FieldLabel>Manglik Preference</FieldLabel>
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field value={formData.manglikPreference} onChange={(e) => updateField('manglikPreference', Number(e.target.value))}>
                        <option value={0}>No preference</option>
                        <option value={1}>Must be</option>
                        <option value={2}>Must not be</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                  <Box>
                    <FieldLabel>Caste</FieldLabel>
                    <Input size="sm" value={formData.castePreferences} onChange={(e) => updateField('castePreferences', e.target.value)} placeholder="Any" />
                  </Box>
                  <Box>
                    <FieldLabel>Sub-Caste</FieldLabel>
                    <Input size="sm" value={formData.subCastePreferences} onChange={(e) => updateField('subCastePreferences', e.target.value)} placeholder="Any" />
                  </Box>
                  <Box>
                    <FieldLabel>Gotra</FieldLabel>
                    <Input size="sm" value={formData.gotraPreferences} onChange={(e) => updateField('gotraPreferences', e.target.value)} placeholder="Any" />
                  </Box>
                </SimpleGrid>
                <FormCheckbox checked={formData.horoscopeMatchingRequired} onChange={(v) => updateField('horoscopeMatchingRequired', v)} label="Horoscope matching required" />
              </VStack>
            </CollapsibleSection>

            {/* Lifestyle */}
            <CollapsibleSection id="lifestyle" title="Lifestyle" subtitle="Children, habits, diet" icon="🌿" isExpanded={expandedSections.lifestyle} onToggle={() => toggleSection('lifestyle')}>
              <VStack align="stretch" gap={3}>
                <Box>
                  <FieldLabel>Children</FieldLabel>
                  <EnumCheckboxGroup values={formData.childrenPreferences} options={childrenOptions} onToggle={(value) => toggleEnumValue('childrenPreferences', value)} />
                </Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box>
                    <FieldLabel>Drinking</FieldLabel>
                    <EnumCheckboxGroup values={formData.drinkingPreferences} options={drinkingOptions} onToggle={(value) => toggleEnumValue('drinkingPreferences', value)} />
                  </Box>
                  <Box>
                    <FieldLabel>Smoking</FieldLabel>
                    <EnumCheckboxGroup values={formData.smokingPreferences} options={smokingOptions} onToggle={(value) => toggleEnumValue('smokingPreferences', value)} />
                  </Box>
                </SimpleGrid>
                <Box>
                  <FieldLabel>Diet</FieldLabel>
                  <EnumCheckboxGroup values={formData.dietaryPreferences} options={dietOptions} onToggle={(value) => toggleEnumValue('dietaryPreferences', value)} />
                </Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box>
                    <FieldLabel>Pets</FieldLabel>
                    <EnumCheckboxGroup values={formData.petPreferences} options={petOptions} onToggle={(value) => toggleEnumValue('petPreferences', value)} />
                  </Box>
                  <Box>
                    <FieldLabel>Workout</FieldLabel>
                    <EnumCheckboxGroup values={formData.workoutPreferences} options={workoutOptions} onToggle={(value) => toggleEnumValue('workoutPreferences', value)} />
                  </Box>
                </SimpleGrid>
              </VStack>
            </CollapsibleSection>

            {/* Personality & Communication */}
            <CollapsibleSection id="personality" title="Personality & Communication" subtitle="Communication style, love language" icon="💬" isExpanded={expandedSections.personality} onToggle={() => toggleSection('personality')}>
              <VStack align="stretch" gap={3}>
                <Box>
                  <FieldLabel>Personality Types (e.g., INTJ, ENFP)</FieldLabel>
                  <Input size="sm" value={formData.personalityTypes} onChange={(e) => updateField('personalityTypes', e.target.value)} placeholder="INTJ, ENFP..." />
                </Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box>
                    <FieldLabel>Communication Style</FieldLabel>
                    <EnumCheckboxGroup values={formData.communicationStyles} options={communicationOptions} onToggle={(value) => toggleEnumValue('communicationStyles', value)} />
                  </Box>
                  <Box>
                    <FieldLabel>Love Language</FieldLabel>
                    <EnumCheckboxGroup values={formData.loveLanguages} options={loveLanguageOptions} onToggle={(value) => toggleEnumValue('loveLanguages', value)} />
                  </Box>
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box>
                    <FieldLabel>Political Views</FieldLabel>
                    <EnumCheckboxGroup values={formData.politicalViews} options={politicalOptions} onToggle={(value) => toggleEnumValue('politicalViews', value)} />
                  </Box>
                  <Box>
                    <FieldLabel>Sleep Schedule</FieldLabel>
                    <EnumCheckboxGroup values={formData.sleepSchedules} options={sleepOptions} onToggle={(value) => toggleEnumValue('sleepSchedules', value)} />
                  </Box>
                </SimpleGrid>
              </VStack>
            </CollapsibleSection>

            {/* Physical Preferences */}
            <CollapsibleSection id="physical" title="Physical Preferences" subtitle="Body type, appearance" icon="👁️" isExpanded={expandedSections.physical} onToggle={() => toggleSection('physical')}>
              <VStack align="stretch" gap={3}>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box>
                    <FieldLabel>Body Type</FieldLabel>
                    <EnumCheckboxGroup values={formData.bodyTypePreferences} options={bodyTypeOptions} onToggle={(value) => toggleEnumValue('bodyTypePreferences', value)} />
                  </Box>
                  <Box>
                    <FieldLabel>Complexion</FieldLabel>
                    <EnumCheckboxGroup values={formData.complexionPreferences} options={complexionOptions} onToggle={(value) => toggleEnumValue('complexionPreferences', value)} />
                  </Box>
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box>
                    <FieldLabel>Hair Color</FieldLabel>
                    <EnumCheckboxGroup values={formData.hairColorPreferences} options={hairColorOptions} onToggle={(value) => toggleEnumValue('hairColorPreferences', value)} />
                  </Box>
                  <Box>
                    <FieldLabel>Eye Color</FieldLabel>
                    <EnumCheckboxGroup values={formData.eyeColorPreferences} options={eyeColorOptions} onToggle={(value) => toggleEnumValue('eyeColorPreferences', value)} />
                  </Box>
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box>
                    <FieldLabel>Tattoo Preference</FieldLabel>
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field value={formData.tattooPreference} onChange={(e) => updateField('tattooPreference', Number(e.target.value))}>
                        <option value={0}>No preference</option>
                        <option value={1}>Must have</option>
                        <option value={2}>Prefer with</option>
                        <option value={3}>Prefer without</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                  <Box>
                    <FieldLabel>Piercing Preference</FieldLabel>
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field value={formData.piercingPreference} onChange={(e) => updateField('piercingPreference', Number(e.target.value))}>
                        <option value={0}>No preference</option>
                        <option value={1}>Must have</option>
                        <option value={2}>Prefer with</option>
                        <option value={3}>Prefer without</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                </SimpleGrid>
              </VStack>
            </CollapsibleSection>

            {/* Financial */}
            <CollapsibleSection id="financial" title="Financial & Professional" subtitle="Income, employment, assets" icon="💰" isExpanded={expandedSections.financial} onToggle={() => toggleSection('financial')}>
              <VStack align="stretch" gap={3}>
                <Box>
                  <FieldLabel>Income Range</FieldLabel>
                  <EnumCheckboxGroup values={formData.incomePreferences} options={incomeOptions} onToggle={(value) => toggleEnumValue('incomePreferences', value)} />
                </Box>
                <Box>
                  <FieldLabel>Employment Type</FieldLabel>
                  <EnumCheckboxGroup values={formData.employmentPreferences} options={employmentOptions} onToggle={(value) => toggleEnumValue('employmentPreferences', value)} />
                </Box>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                  <Box>
                    <FieldLabel>Property</FieldLabel>
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field value={formData.propertyPreference} onChange={(e) => updateField('propertyPreference', Number(e.target.value))}>
                        <option value={0}>No preference</option>
                        <option value={1}>Must own</option>
                        <option value={2}>Prefer owns</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                  <Box>
                    <FieldLabel>Vehicle</FieldLabel>
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field value={formData.vehiclePreference} onChange={(e) => updateField('vehiclePreference', Number(e.target.value))}>
                        <option value={0}>No preference</option>
                        <option value={1}>Must own</option>
                        <option value={2}>Prefer owns</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                  <Box>
                    <FieldLabel>Financial Expectation</FieldLabel>
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field value={formData.financialExpectation} onChange={(e) => updateField('financialExpectation', Number(e.target.value))}>
                        <option value={0}>No preference</option>
                        <option value={1}>Similar</option>
                        <option value={2}>Higher</option>
                        <option value={3}>Lower OK</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                </SimpleGrid>
              </VStack>
            </CollapsibleSection>

            {/* Family */}
            <CollapsibleSection id="family" title="Family Background" subtitle="Family type, values, location" icon="👨‍👩‍👧‍👦" isExpanded={expandedSections.family} onToggle={() => toggleSection('family')}>
              <VStack align="stretch" gap={3}>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                  <Box>
                    <FieldLabel>Family Type</FieldLabel>
                    <EnumCheckboxGroup values={formData.familyTypePreferences} options={familyTypeOptions} onToggle={(value) => toggleEnumValue('familyTypePreferences', value)} />
                  </Box>
                  <Box>
                    <FieldLabel>Family Values</FieldLabel>
                    <EnumCheckboxGroup values={formData.familyValuesPreferences} options={familyValuesOptions} onToggle={(value) => toggleEnumValue('familyValuesPreferences', value)} />
                  </Box>
                  <Box>
                    <FieldLabel>Living Situation</FieldLabel>
                    <EnumCheckboxGroup values={formData.livingSituationPreferences} options={livingSituationOptions} onToggle={(value) => toggleEnumValue('livingSituationPreferences', value)} />
                  </Box>
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box>
                    <FieldLabel>Max Siblings (0 = any)</FieldLabel>
                    <Input type="number" size="sm" value={formData.maxSiblings} onChange={(e) => updateField('maxSiblings', Number(e.target.value))} />
                  </Box>
                  <Box>
                    <FieldLabel>Family Location</FieldLabel>
                    <Input size="sm" value={formData.familyLocationPreferences} onChange={(e) => updateField('familyLocationPreferences', e.target.value)} placeholder="Mumbai, Delhi..." />
                  </Box>
                </SimpleGrid>
              </VStack>
            </CollapsibleSection>

            {/* Location & Language */}
            <CollapsibleSection id="location" title="Location & Language" subtitle="Location, language, relocation" icon="🌍" isExpanded={expandedSections.location} onToggle={() => toggleSection('location')}>
              <VStack align="stretch" gap={3}>
                <Box>
                  <FieldLabel>Languages</FieldLabel>
                  <EnumCheckboxGroup values={formData.languagePreferences} options={languageOptions} onToggle={(value) => toggleEnumValue('languagePreferences', value)} />
                </Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box>
                    <FieldLabel>Location Preferences</FieldLabel>
                    <Input size="sm" value={formData.locationPreferences} onChange={(e) => updateField('locationPreferences', e.target.value)} placeholder="Mumbai, Delhi..." />
                  </Box>
                  <Box>
                    <FieldLabel>Mother Tongue</FieldLabel>
                    <Input size="sm" value={formData.motherTonguePreferences} onChange={(e) => updateField('motherTonguePreferences', e.target.value)} placeholder="Hindi, Tamil..." />
                  </Box>
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box>
                    <FieldLabel>NRI Preference</FieldLabel>
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field value={formData.nriPreference} onChange={(e) => updateField('nriPreference', Number(e.target.value))}>
                        <option value={0}>No preference</option>
                        <option value={1}>Only NRI</option>
                        <option value={2}>Prefer NRI</option>
                        <option value={3}>Prefer non-NRI</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                  <Box>
                    <FieldLabel>Relocation</FieldLabel>
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field value={formData.relocationExpectation} onChange={(e) => updateField('relocationExpectation', Number(e.target.value))}>
                        <option value={0}>Not specified</option>
                        <option value={1}>Willing</option>
                        <option value={2}>Partner should</option>
                        <option value={3}>Discuss</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                </SimpleGrid>
                <Box>
                  <FieldLabel>Ethnicity</FieldLabel>
                  <EnumCheckboxGroup values={formData.ethnicityPreferences} options={ethnicityOptions} onToggle={(value) => toggleEnumValue('ethnicityPreferences', value)} />
                </Box>
                <FormCheckbox checked={formData.openToLongDistance} onChange={(v) => updateField('openToLongDistance', v)} label="Open to long distance" />
              </VStack>
            </CollapsibleSection>

            {/* Interests */}
            <CollapsibleSection id="interests" title="Interests & Hobbies" subtitle="Shared interests" icon="🎯" isExpanded={expandedSections.interests} onToggle={() => toggleSection('interests')}>
              <VStack align="stretch" gap={3}>
                <Box>
                  <FieldLabel>Interests</FieldLabel>
                  <EnumCheckboxGroup values={formData.interestPreferences} options={interestOptions} onToggle={(value) => toggleEnumValue('interestPreferences', value)} />
                </Box>
                <Box>
                  <FieldLabel>Minimum Shared Interests</FieldLabel>
                  <Input type="number" size="sm" value={formData.minSharedInterests} onChange={(e) => updateField('minSharedInterests', Number(e.target.value))} max={10} />
                </Box>
              </VStack>
            </CollapsibleSection>

            {/* Requirements */}
            <CollapsibleSection id="requirements" title="Profile Requirements" subtitle="Activity, photos, deal-breakers" icon="✅" isExpanded={expandedSections.requirements} onToggle={() => toggleSection('requirements')}>
              <VStack align="stretch" gap={3}>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                  <Box>
                    <FieldLabel>Max Days Inactive</FieldLabel>
                    <Input type="number" size="sm" value={formData.maxDaysInactive} onChange={(e) => updateField('maxDaysInactive', Number(e.target.value))} />
                  </Box>
                  <Box>
                    <FieldLabel>Min Profile Completion %</FieldLabel>
                    <Input type="number" size="sm" value={formData.minProfileCompletion} onChange={(e) => updateField('minProfileCompletion', Number(e.target.value))} max={100} />
                  </Box>
                  <Box>
                    <FieldLabel>Disability Acceptance</FieldLabel>
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field value={formData.disabilityAcceptance} onChange={(e) => updateField('disabilityAcceptance', Number(e.target.value))}>
                        <option value={0}>No preference</option>
                        <option value={1}>Full acceptance</option>
                        <option value={2}>Depends</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                </SimpleGrid>
                <FormCheckbox checked={formData.photosRequired} onChange={(v) => updateField('photosRequired', v)} label="Photos required" />
                <Box>
                  <FieldLabel>Custom Deal-breakers (comma-separated)</FieldLabel>
                  <Input size="sm" value={formData.customDealbreakers} onChange={(e) => updateField('customDealbreakers', e.target.value)} placeholder="smoking, gambling..." />
                </Box>
              </VStack>
            </CollapsibleSection>
          </VStack>
        </Box>

        {/* Sticky Footer */}
        <Box
          position="sticky"
          bottom={0}
          bg="white"
          borderTopWidth="1px"
          borderColor="gray.200"
          p={4}
          mt={4}
          boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.1)"
        >
          <HStack justify="space-between">
            <Text fontSize="sm" color="fg.muted">
              {Object.values(expandedSections).filter(Boolean).length} of {Object.keys(expandedSections).length} sections expanded
            </Text>
            <HStack gap={3}>
              <Button
                variant="outline"
                colorPalette="gray"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorPalette="brand"
                disabled={isSaving}
                minW="120px"
              >
                {isSaving ? (
                  <HStack gap={2}>
                    <Spinner size="sm" />
                    <Text>Saving...</Text>
                  </HStack>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </HStack>
          </HStack>
        </Box>
      </form>
    </Box>
  );
};
