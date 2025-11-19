/**
 * Partner Preferences Edit Form
 * Form for editing partner preferences with organized sections
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
} from '@chakra-ui/react';
import { useState } from 'react';
import type { PartnerPreferences } from '../../gen/user/v1/user_pb';

export interface PartnerPreferencesEditFormProps {
  preferences: PartnerPreferences;
  onSave: (updates: PartnerPreferences) => Promise<void>;
  onCancel: () => void;
}

export const PartnerPreferencesEditForm = ({
  preferences,
  onSave,
  onCancel,
}: PartnerPreferencesEditFormProps): JSX.Element => {
  // Basic Preferences
  const [minAge, setMinAge] = useState<number>(preferences.ageRange?.minAge || 18);
  const [maxAge, setMaxAge] = useState<number>(preferences.ageRange?.maxAge || 99);
  const [distancePreference, setDistancePreference] = useState<number>(
    preferences.distancePreference || 50
  );
  const [minHeight, setMinHeight] = useState<number>(
    preferences.heightRange?.minHeight || 150
  );
  const [maxHeight, setMaxHeight] = useState<number>(
    preferences.heightRange?.maxHeight || 200
  );
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(
    preferences.verifiedOnly || false
  );
  const [lookingForMale, setLookingForMale] = useState<boolean>(
    preferences.lookingForGender?.includes(1) || false
  );
  const [lookingForFemale, setLookingForFemale] = useState<boolean>(
    preferences.lookingForGender?.includes(2) || false
  );
  const [lookingForNonBinary, setLookingForNonBinary] = useState<boolean>(
    preferences.lookingForGender?.includes(3) || false
  );

  // Relationship Goals
  const [relationshipGoals, setRelationshipGoals] = useState<number[]>(
    preferences.relationshipGoals || []
  );

  // Education & Career
  const [educationLevels, setEducationLevels] = useState<number[]>(
    preferences.educationLevels || []
  );
  const [occupations, setOccupations] = useState<number[]>(
    preferences.occupations || []
  );
  const [minYearsExperience, setMinYearsExperience] = useState<number>(
    preferences.minYearsExperience || 0
  );
  const [industryPreferences, setIndustryPreferences] = useState<string>(
    preferences.industryPreferences?.join(', ') || ''
  );

  // Religion & Culture
  const [religions, setReligions] = useState<number[]>(
    preferences.religions || []
  );
  const [religionImportance, setReligionImportance] = useState<number>(
    preferences.religionImportance || 0
  );
  const [castePreferences, setCastePreferences] = useState<string>(
    preferences.castePreferences?.join(', ') || ''
  );
  const [subCastePreferences, setSubCastePreferences] = useState<string>(
    preferences.subCastePreferences?.join(', ') || ''
  );
  const [gotraPreferences, setGotraPreferences] = useState<string>(
    preferences.gotraPreferences?.join(', ') || ''
  );
  const [manglikPreference, setManglikPreference] = useState<number>(
    preferences.manglikPreference || 0
  );
  const [horoscopeMatchingRequired, setHoroscopeMatchingRequired] = useState<boolean>(
    preferences.horoscopeMatchingRequired || false
  );

  // Lifestyle Preferences
  const [childrenPreferences, setChildrenPreferences] = useState<number[]>(
    preferences.childrenPreferences || []
  );
  const [drinkingPreferences, setDrinkingPreferences] = useState<number[]>(
    preferences.drinkingPreferences || []
  );
  const [smokingPreferences, setSmokingPreferences] = useState<number[]>(
    preferences.smokingPreferences || []
  );
  const [dietaryPreferences, setDietaryPreferences] = useState<number[]>(
    preferences.dietaryPreferences || []
  );
  const [petPreferences, setPetPreferences] = useState<number[]>(
    preferences.petPreferences || []
  );
  const [workoutPreferences, setWorkoutPreferences] = useState<number[]>(
    preferences.workoutPreferences || []
  );

  // Personality & Communication
  const [personalityTypes, setPersonalityTypes] = useState<string>(
    preferences.personalityTypes?.join(', ') || ''
  );
  const [communicationStyles, setCommunicationStyles] = useState<number[]>(
    preferences.communicationStyles || []
  );
  const [loveLanguages, setLoveLanguages] = useState<number[]>(
    preferences.loveLanguages || []
  );
  const [politicalViews, setPoliticalViews] = useState<number[]>(
    preferences.politicalViews || []
  );
  const [sleepSchedules, setSleepSchedules] = useState<number[]>(
    preferences.sleepSchedules || []
  );

  // Physical Preferences
  const [bodyTypePreferences, setBodyTypePreferences] = useState<number[]>(
    preferences.bodyTypePreferences || []
  );
  const [complexionPreferences, setComplexionPreferences] = useState<number[]>(
    preferences.complexionPreferences || []
  );
  const [hairColorPreferences, setHairColorPreferences] = useState<number[]>(
    preferences.hairColorPreferences || []
  );
  const [eyeColorPreferences, setEyeColorPreferences] = useState<number[]>(
    preferences.eyeColorPreferences || []
  );
  const [facialHairPreferences, setFacialHairPreferences] = useState<number[]>(
    preferences.facialHairPreferences || []
  );
  const [tattooPreference, setTattooPreference] = useState<number>(
    preferences.tattooPreference || 0
  );
  const [piercingPreference, setPiercingPreference] = useState<number>(
    preferences.piercingPreference || 0
  );

  // Financial & Professional
  const [incomePreferences, setIncomePreferences] = useState<number[]>(
    preferences.incomePreferences || []
  );
  const [employmentPreferences, setEmploymentPreferences] = useState<number[]>(
    preferences.employmentPreferences || []
  );
  const [propertyPreference, setPropertyPreference] = useState<number>(
    preferences.propertyPreference || 0
  );
  const [vehiclePreference, setVehiclePreference] = useState<number>(
    preferences.vehiclePreference || 0
  );
  const [financialExpectation, setFinancialExpectation] = useState<number>(
    preferences.financialExpectation || 0
  );

  // Family Background
  const [familyTypePreferences, setFamilyTypePreferences] = useState<number[]>(
    preferences.familyTypePreferences || []
  );
  const [familyValuesPreferences, setFamilyValuesPreferences] = useState<number[]>(
    preferences.familyValuesPreferences || []
  );
  const [livingSituationPreferences, setLivingSituationPreferences] = useState<number[]>(
    preferences.livingSituationPreferences || []
  );
  const [familyAffluencePreferences, setFamilyAffluencePreferences] = useState<number[]>(
    preferences.familyAffluencePreferences || []
  );
  const [maxSiblings, setMaxSiblings] = useState<number>(
    preferences.maxSiblings || 0
  );
  const [familyLocationPreferences, setFamilyLocationPreferences] = useState<string>(
    preferences.familyLocationPreferences?.join(', ') || ''
  );

  // Location & Language
  const [locationPreferences, setLocationPreferences] = useState<string>(
    preferences.locationPreferences?.join(', ') || ''
  );
  const [openToLongDistance, setOpenToLongDistance] = useState<boolean>(
    preferences.openToLongDistance || false
  );
  const [nriPreference, setNriPreference] = useState<number>(
    preferences.nriPreference || 0
  );
  const [relocationExpectation, setRelocationExpectation] = useState<number>(
    preferences.relocationExpectation || 0
  );
  const [languagePreferences, setLanguagePreferences] = useState<number[]>(
    preferences.languagePreferences || []
  );
  const [minLanguageProficiency, setMinLanguageProficiency] = useState<number>(
    preferences.minLanguageProficiency || 0
  );
  const [motherTonguePreferences, setMotherTonguePreferences] = useState<string>(
    preferences.motherTonguePreferences?.join(', ') || ''
  );
  const [nationalityPreferences, setNationalityPreferences] = useState<string>(
    preferences.nationalityPreferences?.join(', ') || ''
  );
  const [ethnicityPreferences, setEthnicityPreferences] = useState<number[]>(
    preferences.ethnicityPreferences || []
  );

  // Interests & Compatibility
  const [interestPreferences, setInterestPreferences] = useState<number[]>(
    preferences.interestPreferences || []
  );
  const [minSharedInterests, setMinSharedInterests] = useState<number>(
    preferences.minSharedInterests || 0
  );

  // Accessibility
  const [disabilityAcceptance, setDisabilityAcceptance] = useState<number>(
    preferences.disabilityAcceptance || 0
  );

  // Profile Requirements
  const [maxDaysInactive, setMaxDaysInactive] = useState<number>(
    preferences.maxDaysInactive || 30
  );
  const [photosRequired, setPhotosRequired] = useState<boolean>(
    preferences.photosRequired || false
  );
  const [minProfileCompletion, setMinProfileCompletion] = useState<number>(
    preferences.minProfileCompletion || 0
  );

  // Deal-breakers & Must-haves
  const [customDealbreakers, setCustomDealbreakers] = useState<string>(
    preferences.customDealbreakers?.join(', ') || ''
  );
  const [dealBreakersInput, setDealBreakersInput] = useState<string>(
    preferences.dealBreakers?.map(d => `${d.type}:${d.description}:${d.priority}`).join(', ') || ''
  );
  const [mustHavesInput, setMustHavesInput] = useState<string>(
    preferences.mustHaves?.map(m => `${m.type}:${m.description}:${m.priority}`).join(', ') || ''
  );

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    const lookingForGender: number[] = [];
    if (lookingForMale) lookingForGender.push(1);
    if (lookingForFemale) lookingForGender.push(2);
    if (lookingForNonBinary) lookingForGender.push(3);

    // Parse deal breakers (format: type:description:priority)
    const dealBreakers = dealBreakersInput
      ? dealBreakersInput.split(',').map(item => {
          const parts = item.trim().split(':');
          return {
            type: Number(parts[0]?.trim()) || 0,
            description: parts[1]?.trim() || '',
            priority: Number(parts[2]?.trim()) || 1,
            $typeName: 'datifyy.user.v1.DealBreaker' as const,
          };
        }).filter(d => d.description)
      : [];

    // Parse must haves (format: type:description:priority)
    const mustHaves = mustHavesInput
      ? mustHavesInput.split(',').map(item => {
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
      // Basic
      ageRange: preferences.ageRange
        ? { ...preferences.ageRange, minAge, maxAge }
        : { minAge, maxAge, $typeName: 'datifyy.user.v1.AgeRange' },
      heightRange: preferences.heightRange
        ? { ...preferences.heightRange, minHeight, maxHeight }
        : { minHeight, maxHeight, $typeName: 'datifyy.user.v1.HeightRange' },
      distancePreference,
      verifiedOnly,
      lookingForGender,

      // Relationship
      relationshipGoals,

      // Education & Career
      educationLevels,
      occupations,
      minYearsExperience,
      industryPreferences: industryPreferences
        ? industryPreferences.split(',').map(s => s.trim()).filter(Boolean)
        : [],

      // Religion & Culture
      religions,
      religionImportance,
      castePreferences: castePreferences
        ? castePreferences.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      subCastePreferences: subCastePreferences
        ? subCastePreferences.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      gotraPreferences: gotraPreferences
        ? gotraPreferences.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      manglikPreference,
      horoscopeMatchingRequired,

      // Lifestyle
      childrenPreferences,
      drinkingPreferences,
      smokingPreferences,
      dietaryPreferences,
      petPreferences,
      workoutPreferences,

      // Personality & Communication
      personalityTypes: personalityTypes
        ? personalityTypes.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      communicationStyles,
      loveLanguages,
      politicalViews,
      sleepSchedules,

      // Physical
      bodyTypePreferences,
      complexionPreferences,
      hairColorPreferences,
      eyeColorPreferences,
      facialHairPreferences,
      tattooPreference,
      piercingPreference,

      // Financial
      incomePreferences,
      employmentPreferences,
      propertyPreference,
      vehiclePreference,
      financialExpectation,

      // Family
      familyTypePreferences,
      familyValuesPreferences,
      livingSituationPreferences,
      familyAffluencePreferences,
      maxSiblings,
      familyLocationPreferences: familyLocationPreferences
        ? familyLocationPreferences.split(',').map(s => s.trim()).filter(Boolean)
        : [],

      // Location & Language
      locationPreferences: locationPreferences
        ? locationPreferences.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      openToLongDistance,
      nriPreference,
      relocationExpectation,
      languagePreferences,
      minLanguageProficiency,
      motherTonguePreferences: motherTonguePreferences
        ? motherTonguePreferences.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      nationalityPreferences: nationalityPreferences
        ? nationalityPreferences.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      ethnicityPreferences,

      // Interests
      interestPreferences,
      minSharedInterests,

      // Accessibility
      disabilityAcceptance,

      // Profile Requirements
      maxDaysInactive,
      photosRequired,
      minProfileCompletion,

      // Deal-breakers
      customDealbreakers: customDealbreakers
        ? customDealbreakers.split(',').map(d => d.trim()).filter(Boolean)
        : [],
      dealBreakers,
      mustHaves,
    };

    await onSave(updates);
  };

  // Helper to toggle enum array value
  const toggleEnumValue = (
    currentValues: number[],
    setValue: React.Dispatch<React.SetStateAction<number[]>>,
    value: number
  ): void => {
    if (currentValues.includes(value)) {
      setValue(currentValues.filter(v => v !== value));
    } else {
      setValue([...currentValues, value]);
    }
  };

  // Form section component
  const FormSection = ({
    title,
    children
  }: {
    title: string;
    children: React.ReactNode;
  }): JSX.Element => (
    <Box
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      p={{ base: 4, md: 6 }}
      mb={4}
    >
      <Heading size="sm" color="fg" mb={4}>{title}</Heading>
      {children}
    </Box>
  );

  // Field label component
  const FieldLabel = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <Text fontSize="sm" color="fg.muted" mb={2}>{children}</Text>
  );

  // Custom checkbox component using native input
  const FormCheckbox = ({
    checked,
    onChange,
    label
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
  }): JSX.Element => (
    <HStack as="label" cursor="pointer" gap={2}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: '18px',
          height: '18px',
          accentColor: 'var(--chakra-colors-brand-500)',
          cursor: 'pointer'
        }}
      />
      <Text fontSize="sm" color="fg">{label}</Text>
    </HStack>
  );

  // Multi-select checkbox group for enums
  const EnumCheckboxGroup = ({
    values,
    setValues,
    options
  }: {
    values: number[];
    setValues: React.Dispatch<React.SetStateAction<number[]>>;
    options: { value: number; label: string }[];
  }): JSX.Element => (
    <SimpleGrid columns={{ base: 2, md: 3 }} gap={2}>
      {options.map(option => (
        <FormCheckbox
          key={option.value}
          checked={values.includes(option.value)}
          onChange={() => toggleEnumValue(values, setValues, option.value)}
          label={option.label}
        />
      ))}
    </SimpleGrid>
  );

  // Enum options
  const relationshipGoalOptions = [
    { value: 1, label: 'Casual Dating' },
    { value: 2, label: 'Serious Relationship' },
    { value: 3, label: 'Marriage' },
    { value: 4, label: 'Friendship' },
    { value: 5, label: 'Open to All' },
  ];

  const educationLevelOptions = [
    { value: 1, label: 'High School' },
    { value: 2, label: 'Associate' },
    { value: 3, label: 'Bachelor' },
    { value: 4, label: 'Master' },
    { value: 5, label: 'Doctorate' },
    { value: 6, label: 'Professional' },
  ];

  const occupationOptions = [
    { value: 1, label: 'Software' },
    { value: 2, label: 'Healthcare' },
    { value: 3, label: 'Finance' },
    { value: 4, label: 'Education' },
    { value: 5, label: 'Engineering' },
    { value: 6, label: 'Legal' },
    { value: 7, label: 'Marketing' },
    { value: 8, label: 'Business Owner' },
    { value: 9, label: 'Government' },
    { value: 10, label: 'Creative' },
  ];

  const religionOptions = [
    { value: 1, label: 'Hindu' },
    { value: 2, label: 'Muslim' },
    { value: 3, label: 'Christian' },
    { value: 4, label: 'Sikh' },
    { value: 5, label: 'Buddhist' },
    { value: 6, label: 'Jain' },
    { value: 7, label: 'Jewish' },
    { value: 8, label: 'Other' },
    { value: 9, label: 'No Religion' },
    { value: 10, label: 'Spiritual' },
  ];

  const childrenPreferenceOptions = [
    { value: 1, label: 'Has Children' },
    { value: 2, label: 'No Children' },
    { value: 3, label: 'Wants Children' },
    { value: 4, label: 'Does Not Want' },
    { value: 5, label: 'Open to Children' },
  ];

  const drinkingOptions = [
    { value: 1, label: 'Never' },
    { value: 2, label: 'Rarely' },
    { value: 3, label: 'Socially' },
    { value: 4, label: 'Regularly' },
  ];

  const smokingOptions = [
    { value: 1, label: 'Never' },
    { value: 2, label: 'Occasionally' },
    { value: 3, label: 'Regularly' },
    { value: 4, label: 'Trying to Quit' },
  ];

  const dietOptions = [
    { value: 1, label: 'Vegetarian' },
    { value: 2, label: 'Non-Vegetarian' },
    { value: 3, label: 'Vegan' },
    { value: 4, label: 'Eggetarian' },
    { value: 5, label: 'Pescatarian' },
  ];

  const petOptions = [
    { value: 1, label: 'Dogs' },
    { value: 2, label: 'Cats' },
    { value: 3, label: 'Birds' },
    { value: 4, label: 'Fish' },
    { value: 5, label: 'Other Pets' },
    { value: 6, label: 'No Pets' },
  ];

  const workoutOptions = [
    { value: 1, label: 'Never' },
    { value: 2, label: 'Occasionally' },
    { value: 3, label: 'Regularly' },
    { value: 4, label: 'Daily' },
  ];

  const communicationStyleOptions = [
    { value: 1, label: 'Direct' },
    { value: 2, label: 'Indirect' },
    { value: 3, label: 'Reserved' },
    { value: 4, label: 'Expressive' },
  ];

  const loveLanguageOptions = [
    { value: 1, label: 'Words of Affirmation' },
    { value: 2, label: 'Acts of Service' },
    { value: 3, label: 'Receiving Gifts' },
    { value: 4, label: 'Quality Time' },
    { value: 5, label: 'Physical Touch' },
  ];

  const politicalViewOptions = [
    { value: 1, label: 'Liberal' },
    { value: 2, label: 'Conservative' },
    { value: 3, label: 'Moderate' },
    { value: 4, label: 'Apolitical' },
  ];

  const sleepScheduleOptions = [
    { value: 1, label: 'Early Bird' },
    { value: 2, label: 'Night Owl' },
    { value: 3, label: 'Flexible' },
  ];

  const bodyTypeOptions = [
    { value: 1, label: 'Slim' },
    { value: 2, label: 'Athletic' },
    { value: 3, label: 'Average' },
    { value: 4, label: 'Curvy' },
    { value: 5, label: 'Muscular' },
    { value: 6, label: 'Heavyset' },
  ];

  const complexionOptions = [
    { value: 1, label: 'Very Fair' },
    { value: 2, label: 'Fair' },
    { value: 3, label: 'Wheatish' },
    { value: 4, label: 'Dusky' },
    { value: 5, label: 'Dark' },
  ];

  const hairColorOptions = [
    { value: 1, label: 'Black' },
    { value: 2, label: 'Brown' },
    { value: 3, label: 'Blonde' },
    { value: 4, label: 'Red' },
    { value: 5, label: 'Gray' },
    { value: 6, label: 'Other' },
  ];

  const eyeColorOptions = [
    { value: 1, label: 'Brown' },
    { value: 2, label: 'Black' },
    { value: 3, label: 'Blue' },
    { value: 4, label: 'Green' },
    { value: 5, label: 'Hazel' },
    { value: 6, label: 'Gray' },
  ];

  const facialHairOptions = [
    { value: 1, label: 'Clean Shaven' },
    { value: 2, label: 'Stubble' },
    { value: 3, label: 'Beard' },
    { value: 4, label: 'Mustache' },
    { value: 5, label: 'Goatee' },
  ];

  const incomeOptions = [
    { value: 1, label: 'Under 3 LPA' },
    { value: 2, label: '3-6 LPA' },
    { value: 3, label: '6-10 LPA' },
    { value: 4, label: '10-20 LPA' },
    { value: 5, label: '20-50 LPA' },
    { value: 6, label: '50+ LPA' },
  ];

  const employmentOptions = [
    { value: 1, label: 'Employed' },
    { value: 2, label: 'Self-Employed' },
    { value: 3, label: 'Business Owner' },
    { value: 4, label: 'Student' },
    { value: 5, label: 'Unemployed' },
    { value: 6, label: 'Retired' },
  ];

  const familyTypeOptions = [
    { value: 1, label: 'Nuclear' },
    { value: 2, label: 'Joint' },
    { value: 3, label: 'Extended' },
  ];

  const familyValuesOptions = [
    { value: 1, label: 'Traditional' },
    { value: 2, label: 'Moderate' },
    { value: 3, label: 'Liberal' },
  ];

  const livingSituationOptions = [
    { value: 1, label: 'With Family' },
    { value: 2, label: 'Alone' },
    { value: 3, label: 'With Roommates' },
    { value: 4, label: 'Own Home' },
    { value: 5, label: 'Renting' },
  ];

  const familyAffluenceOptions = [
    { value: 1, label: 'Lower Class' },
    { value: 2, label: 'Middle Class' },
    { value: 3, label: 'Upper Middle' },
    { value: 4, label: 'Affluent' },
  ];

  const languageOptions = [
    { value: 1, label: 'Hindi' },
    { value: 2, label: 'English' },
    { value: 3, label: 'Bengali' },
    { value: 4, label: 'Tamil' },
    { value: 5, label: 'Telugu' },
    { value: 6, label: 'Marathi' },
    { value: 7, label: 'Gujarati' },
    { value: 8, label: 'Kannada' },
    { value: 9, label: 'Malayalam' },
    { value: 10, label: 'Punjabi' },
  ];

  const ethnicityOptions = [
    { value: 1, label: 'South Asian' },
    { value: 2, label: 'East Asian' },
    { value: 3, label: 'Southeast Asian' },
    { value: 4, label: 'Caucasian' },
    { value: 5, label: 'African' },
    { value: 6, label: 'Middle Eastern' },
    { value: 7, label: 'Hispanic' },
    { value: 8, label: 'Mixed' },
  ];

  const interestOptions = [
    { value: 1, label: 'Sports' },
    { value: 2, label: 'Music' },
    { value: 3, label: 'Movies' },
    { value: 4, label: 'Travel' },
    { value: 5, label: 'Reading' },
    { value: 6, label: 'Cooking' },
    { value: 7, label: 'Gaming' },
    { value: 8, label: 'Fitness' },
    { value: 9, label: 'Art' },
    { value: 10, label: 'Photography' },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <VStack align="stretch" gap={4}>
        {/* Basic Preferences */}
        <FormSection title="Looking For">
          <VStack align="start" gap={2}>
            <FormCheckbox
              checked={lookingForMale}
              onChange={setLookingForMale}
              label="Male"
            />
            <FormCheckbox
              checked={lookingForFemale}
              onChange={setLookingForFemale}
              label="Female"
            />
            <FormCheckbox
              checked={lookingForNonBinary}
              onChange={setLookingForNonBinary}
              label="Non-binary"
            />
          </VStack>
        </FormSection>

        <FormSection title="Age Range">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <Box>
              <FieldLabel>Minimum Age</FieldLabel>
              <Input
                type="number"
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                min={18}
                max={99}
              />
            </Box>
            <Box>
              <FieldLabel>Maximum Age</FieldLabel>
              <Input
                type="number"
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                min={18}
                max={99}
              />
            </Box>
          </SimpleGrid>
        </FormSection>

        <FormSection title="Height Range">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <Box>
              <FieldLabel>Minimum Height (cm)</FieldLabel>
              <Input
                type="number"
                value={minHeight}
                onChange={(e) => setMinHeight(Number(e.target.value))}
                min={100}
                max={220}
              />
            </Box>
            <Box>
              <FieldLabel>Maximum Height (cm)</FieldLabel>
              <Input
                type="number"
                value={maxHeight}
                onChange={(e) => setMaxHeight(Number(e.target.value))}
                min={100}
                max={220}
              />
            </Box>
          </SimpleGrid>
        </FormSection>

        <FormSection title="Distance">
          <Box>
            <FieldLabel>Maximum Distance (km)</FieldLabel>
            <Input
              type="number"
              value={distancePreference}
              onChange={(e) => setDistancePreference(Number(e.target.value))}
              min={1}
              max={500}
            />
          </Box>
        </FormSection>

        <FormSection title="Verification">
          <FormCheckbox
            checked={verifiedOnly}
            onChange={setVerifiedOnly}
            label="Show only verified profiles"
          />
        </FormSection>

        {/* Relationship Goals */}
        <FormSection title="Relationship Goals">
          <EnumCheckboxGroup
            values={relationshipGoals}
            setValues={setRelationshipGoals}
            options={relationshipGoalOptions}
          />
        </FormSection>

        {/* Education & Career */}
        <FormSection title="Education Levels">
          <EnumCheckboxGroup
            values={educationLevels}
            setValues={setEducationLevels}
            options={educationLevelOptions}
          />
        </FormSection>

        <FormSection title="Occupations">
          <EnumCheckboxGroup
            values={occupations}
            setValues={setOccupations}
            options={occupationOptions}
          />
        </FormSection>

        <FormSection title="Experience">
          <Box>
            <FieldLabel>Minimum Years of Experience</FieldLabel>
            <Input
              type="number"
              value={minYearsExperience}
              onChange={(e) => setMinYearsExperience(Number(e.target.value))}
              min={0}
              max={30}
            />
          </Box>
        </FormSection>

        <FormSection title="Industries">
          <Input
            value={industryPreferences}
            onChange={(e) => setIndustryPreferences(e.target.value)}
            placeholder="e.g., Technology, Healthcare, Finance"
          />
          <Text fontSize="xs" color="fg.muted" mt={1}>
            Separate multiple items with commas
          </Text>
        </FormSection>

        {/* Religion & Culture */}
        <FormSection title="Religions">
          <EnumCheckboxGroup
            values={religions}
            setValues={setReligions}
            options={religionOptions}
          />
        </FormSection>

        <FormSection title="Religion Importance">
          <NativeSelect.Root>
            <NativeSelect.Field
              value={religionImportance}
              onChange={(e) => setReligionImportance(Number(e.target.value))}
            >
              <option value={0}>Not specified</option>
              <option value={1}>Not important</option>
              <option value={2}>Somewhat important</option>
              <option value={3}>Important</option>
              <option value={4}>Very important</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </FormSection>

        <FormSection title="Caste Preferences">
          <Input
            value={castePreferences}
            onChange={(e) => setCastePreferences(e.target.value)}
            placeholder="e.g., Brahmin, Kshatriya, Vaishya"
          />
          <Text fontSize="xs" color="fg.muted" mt={1}>
            Separate multiple items with commas
          </Text>
        </FormSection>

        <FormSection title="Sub-Caste Preferences">
          <Input
            value={subCastePreferences}
            onChange={(e) => setSubCastePreferences(e.target.value)}
            placeholder="Enter sub-caste preferences"
          />
          <Text fontSize="xs" color="fg.muted" mt={1}>
            Separate multiple items with commas
          </Text>
        </FormSection>

        <FormSection title="Gotra Preferences">
          <Input
            value={gotraPreferences}
            onChange={(e) => setGotraPreferences(e.target.value)}
            placeholder="Enter gotra preferences"
          />
          <Text fontSize="xs" color="fg.muted" mt={1}>
            Separate multiple items with commas
          </Text>
        </FormSection>

        <FormSection title="Manglik Preference">
          <NativeSelect.Root>
            <NativeSelect.Field
              value={manglikPreference}
              onChange={(e) => setManglikPreference(Number(e.target.value))}
            >
              <option value={0}>No preference</option>
              <option value={1}>Must be Manglik</option>
              <option value={2}>Must not be Manglik</option>
              <option value={3}>Doesn't matter</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </FormSection>

        <FormSection title="Horoscope Matching">
          <FormCheckbox
            checked={horoscopeMatchingRequired}
            onChange={setHoroscopeMatchingRequired}
            label="Horoscope matching required"
          />
        </FormSection>

        {/* Lifestyle */}
        <FormSection title="Children Preferences">
          <EnumCheckboxGroup
            values={childrenPreferences}
            setValues={setChildrenPreferences}
            options={childrenPreferenceOptions}
          />
        </FormSection>

        <FormSection title="Drinking Preferences">
          <EnumCheckboxGroup
            values={drinkingPreferences}
            setValues={setDrinkingPreferences}
            options={drinkingOptions}
          />
        </FormSection>

        <FormSection title="Smoking Preferences">
          <EnumCheckboxGroup
            values={smokingPreferences}
            setValues={setSmokingPreferences}
            options={smokingOptions}
          />
        </FormSection>

        <FormSection title="Dietary Preferences">
          <EnumCheckboxGroup
            values={dietaryPreferences}
            setValues={setDietaryPreferences}
            options={dietOptions}
          />
        </FormSection>

        <FormSection title="Pet Preferences">
          <EnumCheckboxGroup
            values={petPreferences}
            setValues={setPetPreferences}
            options={petOptions}
          />
        </FormSection>

        <FormSection title="Workout Preferences">
          <EnumCheckboxGroup
            values={workoutPreferences}
            setValues={setWorkoutPreferences}
            options={workoutOptions}
          />
        </FormSection>

        {/* Personality & Communication */}
        <FormSection title="Personality Types">
          <Input
            value={personalityTypes}
            onChange={(e) => setPersonalityTypes(e.target.value)}
            placeholder="e.g., INTJ, ENFP, ISTJ"
          />
          <Text fontSize="xs" color="fg.muted" mt={1}>
            Separate multiple items with commas
          </Text>
        </FormSection>

        <FormSection title="Communication Styles">
          <EnumCheckboxGroup
            values={communicationStyles}
            setValues={setCommunicationStyles}
            options={communicationStyleOptions}
          />
        </FormSection>

        <FormSection title="Love Languages">
          <EnumCheckboxGroup
            values={loveLanguages}
            setValues={setLoveLanguages}
            options={loveLanguageOptions}
          />
        </FormSection>

        <FormSection title="Political Views">
          <EnumCheckboxGroup
            values={politicalViews}
            setValues={setPoliticalViews}
            options={politicalViewOptions}
          />
        </FormSection>

        <FormSection title="Sleep Schedules">
          <EnumCheckboxGroup
            values={sleepSchedules}
            setValues={setSleepSchedules}
            options={sleepScheduleOptions}
          />
        </FormSection>

        {/* Physical Preferences */}
        <FormSection title="Body Type Preferences">
          <EnumCheckboxGroup
            values={bodyTypePreferences}
            setValues={setBodyTypePreferences}
            options={bodyTypeOptions}
          />
        </FormSection>

        <FormSection title="Complexion Preferences">
          <EnumCheckboxGroup
            values={complexionPreferences}
            setValues={setComplexionPreferences}
            options={complexionOptions}
          />
        </FormSection>

        <FormSection title="Hair Color Preferences">
          <EnumCheckboxGroup
            values={hairColorPreferences}
            setValues={setHairColorPreferences}
            options={hairColorOptions}
          />
        </FormSection>

        <FormSection title="Eye Color Preferences">
          <EnumCheckboxGroup
            values={eyeColorPreferences}
            setValues={setEyeColorPreferences}
            options={eyeColorOptions}
          />
        </FormSection>

        <FormSection title="Facial Hair Preferences">
          <EnumCheckboxGroup
            values={facialHairPreferences}
            setValues={setFacialHairPreferences}
            options={facialHairOptions}
          />
        </FormSection>

        <FormSection title="Tattoo Preference">
          <NativeSelect.Root>
            <NativeSelect.Field
              value={tattooPreference}
              onChange={(e) => setTattooPreference(Number(e.target.value))}
            >
              <option value={0}>No preference</option>
              <option value={1}>Must have</option>
              <option value={2}>Prefer with</option>
              <option value={3}>Prefer without</option>
              <option value={4}>Must not have</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </FormSection>

        <FormSection title="Piercing Preference">
          <NativeSelect.Root>
            <NativeSelect.Field
              value={piercingPreference}
              onChange={(e) => setPiercingPreference(Number(e.target.value))}
            >
              <option value={0}>No preference</option>
              <option value={1}>Must have</option>
              <option value={2}>Prefer with</option>
              <option value={3}>Prefer without</option>
              <option value={4}>Must not have</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </FormSection>

        {/* Financial & Professional */}
        <FormSection title="Income Preferences">
          <EnumCheckboxGroup
            values={incomePreferences}
            setValues={setIncomePreferences}
            options={incomeOptions}
          />
        </FormSection>

        <FormSection title="Employment Preferences">
          <EnumCheckboxGroup
            values={employmentPreferences}
            setValues={setEmploymentPreferences}
            options={employmentOptions}
          />
        </FormSection>

        <FormSection title="Property Preference">
          <NativeSelect.Root>
            <NativeSelect.Field
              value={propertyPreference}
              onChange={(e) => setPropertyPreference(Number(e.target.value))}
            >
              <option value={0}>No preference</option>
              <option value={1}>Must own</option>
              <option value={2}>Prefer owns</option>
              <option value={3}>Doesn't matter</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </FormSection>

        <FormSection title="Vehicle Preference">
          <NativeSelect.Root>
            <NativeSelect.Field
              value={vehiclePreference}
              onChange={(e) => setVehiclePreference(Number(e.target.value))}
            >
              <option value={0}>No preference</option>
              <option value={1}>Must own</option>
              <option value={2}>Prefer owns</option>
              <option value={3}>Doesn't matter</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </FormSection>

        <FormSection title="Financial Expectation">
          <NativeSelect.Root>
            <NativeSelect.Field
              value={financialExpectation}
              onChange={(e) => setFinancialExpectation(Number(e.target.value))}
            >
              <option value={0}>No preference</option>
              <option value={1}>Similar income</option>
              <option value={2}>Higher income</option>
              <option value={3}>Lower income okay</option>
              <option value={4}>Doesn't matter</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </FormSection>

        {/* Family Background */}
        <FormSection title="Family Type Preferences">
          <EnumCheckboxGroup
            values={familyTypePreferences}
            setValues={setFamilyTypePreferences}
            options={familyTypeOptions}
          />
        </FormSection>

        <FormSection title="Family Values Preferences">
          <EnumCheckboxGroup
            values={familyValuesPreferences}
            setValues={setFamilyValuesPreferences}
            options={familyValuesOptions}
          />
        </FormSection>

        <FormSection title="Living Situation Preferences">
          <EnumCheckboxGroup
            values={livingSituationPreferences}
            setValues={setLivingSituationPreferences}
            options={livingSituationOptions}
          />
        </FormSection>

        <FormSection title="Family Affluence Preferences">
          <EnumCheckboxGroup
            values={familyAffluencePreferences}
            setValues={setFamilyAffluencePreferences}
            options={familyAffluenceOptions}
          />
        </FormSection>

        <FormSection title="Family Size">
          <Box>
            <FieldLabel>Maximum Siblings (0 = No preference)</FieldLabel>
            <Input
              type="number"
              value={maxSiblings}
              onChange={(e) => setMaxSiblings(Number(e.target.value))}
              min={0}
              max={10}
            />
          </Box>
        </FormSection>

        <FormSection title="Family Location Preferences">
          <Input
            value={familyLocationPreferences}
            onChange={(e) => setFamilyLocationPreferences(e.target.value)}
            placeholder="e.g., Mumbai, Delhi, Bangalore"
          />
          <Text fontSize="xs" color="fg.muted" mt={1}>
            Separate multiple items with commas
          </Text>
        </FormSection>

        {/* Location & Language */}
        <FormSection title="Location Preferences">
          <Input
            value={locationPreferences}
            onChange={(e) => setLocationPreferences(e.target.value)}
            placeholder="e.g., Mumbai, Delhi, Bangalore"
          />
          <Text fontSize="xs" color="fg.muted" mt={1}>
            Separate multiple items with commas
          </Text>
        </FormSection>

        <FormSection title="Long Distance">
          <FormCheckbox
            checked={openToLongDistance}
            onChange={setOpenToLongDistance}
            label="Open to long distance relationships"
          />
        </FormSection>

        <FormSection title="NRI Preference">
          <NativeSelect.Root>
            <NativeSelect.Field
              value={nriPreference}
              onChange={(e) => setNriPreference(Number(e.target.value))}
            >
              <option value={0}>No preference</option>
              <option value={1}>Only NRI</option>
              <option value={2}>Prefer NRI</option>
              <option value={3}>Prefer non-NRI</option>
              <option value={4}>Only non-NRI</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </FormSection>

        <FormSection title="Relocation Expectation">
          <NativeSelect.Root>
            <NativeSelect.Field
              value={relocationExpectation}
              onChange={(e) => setRelocationExpectation(Number(e.target.value))}
            >
              <option value={0}>Not specified</option>
              <option value={1}>Willing to relocate</option>
              <option value={2}>Partner should relocate</option>
              <option value={3}>Open to discussion</option>
              <option value={4}>Not willing to relocate</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </FormSection>

        <FormSection title="Language Preferences">
          <EnumCheckboxGroup
            values={languagePreferences}
            setValues={setLanguagePreferences}
            options={languageOptions}
          />
        </FormSection>

        <FormSection title="Minimum Language Proficiency">
          <NativeSelect.Root>
            <NativeSelect.Field
              value={minLanguageProficiency}
              onChange={(e) => setMinLanguageProficiency(Number(e.target.value))}
            >
              <option value={0}>No preference</option>
              <option value={1}>Basic</option>
              <option value={2}>Conversational</option>
              <option value={3}>Fluent</option>
              <option value={4}>Native</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </FormSection>

        <FormSection title="Mother Tongue Preferences">
          <Input
            value={motherTonguePreferences}
            onChange={(e) => setMotherTonguePreferences(e.target.value)}
            placeholder="e.g., Hindi, Tamil, Bengali"
          />
          <Text fontSize="xs" color="fg.muted" mt={1}>
            Separate multiple items with commas
          </Text>
        </FormSection>

        <FormSection title="Nationality Preferences">
          <Input
            value={nationalityPreferences}
            onChange={(e) => setNationalityPreferences(e.target.value)}
            placeholder="e.g., Indian, American, Canadian"
          />
          <Text fontSize="xs" color="fg.muted" mt={1}>
            Separate multiple items with commas
          </Text>
        </FormSection>

        <FormSection title="Ethnicity Preferences">
          <EnumCheckboxGroup
            values={ethnicityPreferences}
            setValues={setEthnicityPreferences}
            options={ethnicityOptions}
          />
        </FormSection>

        {/* Interests & Compatibility */}
        <FormSection title="Interest Preferences">
          <EnumCheckboxGroup
            values={interestPreferences}
            setValues={setInterestPreferences}
            options={interestOptions}
          />
        </FormSection>

        <FormSection title="Shared Interests">
          <Box>
            <FieldLabel>Minimum Shared Interests</FieldLabel>
            <Input
              type="number"
              value={minSharedInterests}
              onChange={(e) => setMinSharedInterests(Number(e.target.value))}
              min={0}
              max={20}
            />
          </Box>
        </FormSection>

        {/* Accessibility */}
        <FormSection title="Disability Acceptance">
          <NativeSelect.Root>
            <NativeSelect.Field
              value={disabilityAcceptance}
              onChange={(e) => setDisabilityAcceptance(Number(e.target.value))}
            >
              <option value={0}>No preference</option>
              <option value={1}>Full acceptance</option>
              <option value={2}>Depends on disability</option>
              <option value={3}>Not open</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </FormSection>

        {/* Profile Requirements */}
        <FormSection title="Activity">
          <Box>
            <FieldLabel>Maximum Days Inactive</FieldLabel>
            <Input
              type="number"
              value={maxDaysInactive}
              onChange={(e) => setMaxDaysInactive(Number(e.target.value))}
              min={1}
              max={365}
            />
          </Box>
        </FormSection>

        <FormSection title="Profile Requirements">
          <VStack align="start" gap={3}>
            <FormCheckbox
              checked={photosRequired}
              onChange={setPhotosRequired}
              label="Photos required"
            />
            <Box w="100%">
              <FieldLabel>Minimum Profile Completion (%)</FieldLabel>
              <Input
                type="number"
                value={minProfileCompletion}
                onChange={(e) => setMinProfileCompletion(Number(e.target.value))}
                min={0}
                max={100}
              />
            </Box>
          </VStack>
        </FormSection>

        {/* Deal-breakers & Must-haves */}
        <FormSection title="Custom Deal-breakers">
          <Input
            value={customDealbreakers}
            onChange={(e) => setCustomDealbreakers(e.target.value)}
            placeholder="e.g., smoking, no pets, long distance"
          />
          <Text fontSize="xs" color="fg.muted" mt={1}>
            Separate multiple items with commas
          </Text>
        </FormSection>

        <FormSection title="Deal Breakers">
          <Input
            value={dealBreakersInput}
            onChange={(e) => setDealBreakersInput(e.target.value)}
            placeholder="e.g., 1:Must not smoke:5, 2:No pets:3"
          />
          <Text fontSize="xs" color="fg.muted" mt={1}>
            Format: type:description:priority (1-5), separate multiple with commas
          </Text>
        </FormSection>

        <FormSection title="Must Haves">
          <Input
            value={mustHavesInput}
            onChange={(e) => setMustHavesInput(e.target.value)}
            placeholder="e.g., 1:College degree:5, 2:Employed:4"
          />
          <Text fontSize="xs" color="fg.muted" mt={1}>
            Format: type:description:priority (1-5), separate multiple with commas
          </Text>
        </FormSection>

        {/* Action Buttons */}
        <HStack justify="flex-end" gap={4} pt={4}>
          <Button
            variant="outline"
            colorPalette="brand"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            colorPalette="brand"
          >
            Save Changes
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};
