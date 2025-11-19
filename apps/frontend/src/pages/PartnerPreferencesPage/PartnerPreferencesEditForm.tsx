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

  // Lifestyle Preferences
  const [religionImportance, setReligionImportance] = useState<number>(
    preferences.religionImportance || 0
  );
  const [openToLongDistance, setOpenToLongDistance] = useState<boolean>(
    preferences.openToLongDistance || false
  );
  const [minSharedInterests, setMinSharedInterests] = useState<number>(
    preferences.minSharedInterests || 0
  );

  // Cultural & Matrimonial
  const [horoscopeMatchingRequired, setHoroscopeMatchingRequired] = useState<boolean>(
    preferences.horoscopeMatchingRequired || false
  );
  const [maxSiblings, setMaxSiblings] = useState<number>(
    preferences.maxSiblings || 0
  );

  // Professional
  const [minYearsExperience, setMinYearsExperience] = useState<number>(
    preferences.minYearsExperience || 0
  );

  // Deal-breakers
  const [maxDaysInactive, setMaxDaysInactive] = useState<number>(
    preferences.maxDaysInactive || 30
  );
  const [photosRequired, setPhotosRequired] = useState<boolean>(
    preferences.photosRequired || false
  );
  const [minProfileCompletion, setMinProfileCompletion] = useState<number>(
    preferences.minProfileCompletion || 0
  );
  const [customDealbreakers, setCustomDealbreakers] = useState<string>(
    preferences.customDealbreakers?.join(', ') || ''
  );

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    const lookingForGender: number[] = [];
    if (lookingForMale) lookingForGender.push(1);
    if (lookingForFemale) lookingForGender.push(2);
    if (lookingForNonBinary) lookingForGender.push(3);

    const updates: PartnerPreferences = {
      ...preferences,
      ageRange: preferences.ageRange
        ? { ...preferences.ageRange, minAge, maxAge }
        : { minAge, maxAge, $typeName: 'datifyy.user.v1.AgeRange' },
      heightRange: preferences.heightRange
        ? { ...preferences.heightRange, minHeight, maxHeight }
        : { minHeight, maxHeight, $typeName: 'datifyy.user.v1.HeightRange' },
      distancePreference,
      verifiedOnly,
      lookingForGender,
      religionImportance,
      horoscopeMatchingRequired,
      openToLongDistance,
      minYearsExperience,
      maxSiblings,
      minSharedInterests,
      maxDaysInactive,
      photosRequired,
      minProfileCompletion,
      customDealbreakers: customDealbreakers
        ? customDealbreakers.split(',').map((d) => d.trim()).filter(Boolean)
        : [],
    };

    await onSave(updates);
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

        {/* Lifestyle */}
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

        <FormSection title="Long Distance">
          <FormCheckbox
            checked={openToLongDistance}
            onChange={setOpenToLongDistance}
            label="Open to long distance relationships"
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

        {/* Cultural */}
        <FormSection title="Horoscope Matching">
          <FormCheckbox
            checked={horoscopeMatchingRequired}
            onChange={setHoroscopeMatchingRequired}
            label="Horoscope matching required"
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

        {/* Professional */}
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

        {/* Deal-breakers */}
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
