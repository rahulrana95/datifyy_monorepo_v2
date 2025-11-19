/**
 * Partner Preferences Edit Form
 * Form for editing partner preferences
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
  const [dealbreakers, setDealbreakers] = useState<string>(
    preferences.dealbreakers?.join(', ') || ''
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
        : undefined,
      heightRange: preferences.heightRange
        ? { ...preferences.heightRange, minHeight, maxHeight }
        : undefined,
      distancePreference,
      verifiedOnly,
      lookingForGender,
      dealbreakers: dealbreakers
        ? dealbreakers.split(',').map((d) => d.trim()).filter(Boolean)
        : [],
    };

    await onSave(updates);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack align="stretch" gap={6}>
        {/* Basic Preferences Section */}
        <Box
          bg="white"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="gray.200"
          p={{ base: 4, md: 8 }}
          boxShadow="md"
        >
          <Heading size="md" color="fg" mb={4}>
            Basic Preferences
          </Heading>

          {/* Looking For */}
          <Box mb={6}>
            <Text fontSize="sm" color="fg.muted" mb={2}>
              Looking For (select one or more)
            </Text>
            <VStack align="start" gap={2}>
              <Box>
                <input
                  type="checkbox"
                  id="lookingForMale"
                  checked={lookingForMale}
                  onChange={(e) => setLookingForMale(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor="lookingForMale">Male</label>
              </Box>
              <Box>
                <input
                  type="checkbox"
                  id="lookingForFemale"
                  checked={lookingForFemale}
                  onChange={(e) => setLookingForFemale(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor="lookingForFemale">Female</label>
              </Box>
              <Box>
                <input
                  type="checkbox"
                  id="lookingForNonBinary"
                  checked={lookingForNonBinary}
                  onChange={(e) => setLookingForNonBinary(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor="lookingForNonBinary">Non-binary</label>
              </Box>
            </VStack>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            {/* Age Range */}
            <Box>
              <Text fontSize="sm" color="fg.muted" mb={2}>
                Minimum Age
              </Text>
              <Input
                type="number"
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                min={18}
                max={99}
              />
            </Box>

            <Box>
              <Text fontSize="sm" color="fg.muted" mb={2}>
                Maximum Age
              </Text>
              <Input
                type="number"
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                min={18}
                max={99}
              />
            </Box>

            {/* Height Range */}
            <Box>
              <Text fontSize="sm" color="fg.muted" mb={2}>
                Minimum Height (cm)
              </Text>
              <Input
                type="number"
                value={minHeight}
                onChange={(e) => setMinHeight(Number(e.target.value))}
                min={100}
                max={250}
              />
            </Box>

            <Box>
              <Text fontSize="sm" color="fg.muted" mb={2}>
                Maximum Height (cm)
              </Text>
              <Input
                type="number"
                value={maxHeight}
                onChange={(e) => setMaxHeight(Number(e.target.value))}
                min={100}
                max={250}
              />
            </Box>

            {/* Distance Preference */}
            <Box>
              <Text fontSize="sm" color="fg.muted" mb={2}>
                Maximum Distance (km)
              </Text>
              <Input
                type="number"
                value={distancePreference}
                onChange={(e) => setDistancePreference(Number(e.target.value))}
                min={1}
                max={500}
              />
            </Box>

            {/* Verified Only */}
            <Box>
              <Text fontSize="sm" color="fg.muted" mb={2}>
                Profile Verification
              </Text>
              <Box>
                <input
                  type="checkbox"
                  id="verifiedOnly"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor="verifiedOnly">Show only verified profiles</label>
              </Box>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Dealbreakers Section */}
        <Box
          bg="white"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="gray.200"
          p={{ base: 4, md: 8 }}
          boxShadow="md"
        >
          <Heading size="md" color="fg" mb={4}>
            Dealbreakers
          </Heading>
          <Box>
            <Text fontSize="sm" color="fg.muted" mb={2}>
              Dealbreakers (comma-separated)
            </Text>
            <Input
              value={dealbreakers}
              onChange={(e) => setDealbreakers(e.target.value)}
              placeholder="e.g., smoking, no pets, long distance"
            />
          </Box>
        </Box>

        {/* Action Buttons */}
        <HStack justify="flex-end" gap={4}>
          <Button
            bg="white"
            borderWidth="1px"
            borderColor="brand.500"
            color="brand.600"
            _hover={{ bg: 'brand.50', borderColor: 'brand.600' }}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            bg="brand.500"
            color="white"
            _hover={{ bg: 'brand.600' }}
            _active={{ bg: 'brand.700' }}
          >
            Save Changes
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};
