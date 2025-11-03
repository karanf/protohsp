# Comprehensive Student Mock Data Generator

This document explains the detailed student mock data generator that creates realistic and varied student application data for SEVIS processing workflows.

## Overview

The mock data generator creates comprehensive student profiles that match the detailed application structure shown in the `sevis-processing-student-view.tsx` component. Each generated student includes:

- **Personal Information**: Complete biographical data
- **Contact Information**: Phone numbers, email, addresses
- **Academic Information**: School details, grades, subjects, English proficiency
- **Program Information**: Exchange program type and preferences
- **Family Information**: Detailed parent/guardian data
- **Activities & Interests**: Extracurriculars, hobbies, detailed descriptions
- **Personality Assessment**: Interview ratings and evaluations
- **Student Biography**: Personal statement and "Dear Family" letter
- **Preferences**: Dietary restrictions, allergies, housing preferences
- **Languages**: Native and additional language proficiencies
- **Awards**: Academic and extracurricular achievements
- **SEVIS Information**: Application status and processing data

## Countries & Cultures Included

The generator creates students from 10 different countries (avoiding duplication with existing data):

1. **Norway** - Norwegian language, Nordic culture
2. **Netherlands** - Dutch language, European culture
3. **Poland** - Polish language, Central European culture
4. **Denmark** - Danish language, Scandinavian culture
5. **Finland** - Finnish language, Nordic culture
6. **Austria** - German language, Alpine culture
7. **Belgium** - Dutch/French languages, Western European culture
8. **Switzerland** - German/French languages, Alpine culture
9. **Portugal** - Portuguese language, Southern European culture
10. **Czech Republic** - Czech language, Central European culture

Each country includes:
- Authentic first names and surnames
- Realistic cities and addresses
- Proper phone number formats
- Cultural considerations for activities and interests
- Appropriate language learning patterns

## Usage

### Basic Usage

```javascript
import { generateStudentProfile, generateMultipleStudents } from './detailed-student-mock-data.js';

// Generate a single student
const student = generateStudentProfile(0);

// Generate multiple students
const students = generateMultipleStudents(20);
```

### Running the Examples

```bash
# Generate and display sample students
node detailed-student-mock-data.js

# View comprehensive data structure
node sample-detailed-student-data.js
```

## Data Structure

### Personal Information
- `firstName`, `lastName`, `fullName`, `preferredName`
- `gender`, `dateOfBirth`, `age`
- `cityOfBirth`, `countryOfBirth`, `countryOfCitizenship`

### Contact Information
- `email`, `cellPhone`, `homePhone`
- `address` object with `line1`, `line2`, `city`, `postalCode`, `country`

### Academic Information
- `currentGrade`, `currentSchool`, `schoolType`
- `graduationDate`, `favoriteSubjects`
- `englishYears`, `englishProficiency`

### Program Information
- `programType` (Academic Year, Semester Fall/Spring)
- `preferredStates` (array of 3 US states)

### Family Information
- `parents.father` and `parents.mother` with complete details
- Parent occupations, contact info, legal guardian status
- `relationshipStatus`, `livingArrangement`

### Activities & Interests
- `extracurriculars` (1-3 activities)
- `hobbies` (2-4 hobbies)
- `favoriteActivity1`, `favoriteActivity2`, `favoriteActivity3` with detailed descriptions

### Assessment & Evaluation
- `personalityRatings` (10-point scale ratings)
- `interview` details (length, date, interviewer, GPA assessment)

### Biography & Letters
- `studentBio` (comprehensive personal statement)
- `dearFamilyLetter` (formatted letter to host family)

### Preferences & Requirements
- `dietaryRestrictions`, `allergies`, `petPreference`

### Languages
- `nativeLanguage`
- `additionalLanguages` array with proficiency levels

### Awards & Achievements
- Array of 2 awards with institution, reason, and dates

### SEVIS Information
- `sevisId`, `applicationStatus`, `approvalDate`
- `approvedBy`, `lastAction`

## Realistic Variations

The generator creates realistic variations through:

### Age & Grade Distribution
- Ages 15-17 corresponding to grades 10th-12th
- Appropriate graduation dates based on age

### English Proficiency Levels
- 4-10 years of English study
- Proficiency levels: Elementary (A2), Pre-Intermediate (B1), Intermediate (B2)
- Ratings correlate with years of study

### Cultural Authenticity
- Country-appropriate names and surnames
- Realistic phone number formats
- Proper postal code formats
- Cultural activity preferences

### Family Diversity
- Varied parent occupations
- Different family structures (together, married)
- Diverse living arrangements (house, apartment)

### Academic Interests
- Balanced distribution across STEM, Humanities, Arts, Languages
- Realistic subject combinations
- Varied extracurricular participation

### Program Preferences
- Logical state preference groupings (warm states, mountain states, etc.)
- Balanced program type distribution
- Realistic timeline preferences

### Health & Dietary Considerations
- 70% no dietary restrictions, 30% with specific needs
- 80% no allergies, 20% with common allergies
- Varied pet preferences

### SEVIS Processing Status
- Realistic distribution of application statuses
- Appropriate approval dates and processing timeline
- Varied reviewer assignments

## Integration with SEVIS Processing View

The data structure directly maps to the sections shown in `sevis-processing-student-view.tsx`:

### Header Section
- Student name, avatar, status badge
- Basic demographic information

### Information Grid
- Personal Information section
- Program Details section  
- SEVIS Information section

### Expandable Sections
- **Program Timeline**: Uses program dates and SEVIS milestones
- **Application Details**: Status, documents, placement details
- **Partner Assessment**: Interview data, personality ratings, evaluations
- **Student Details**: Personal and contact information
- **Family**: Parent/guardian information, siblings, US contacts
- **Biography**: Activities, bio, awards, achievements
- **School & Languages**: Academic info, language proficiencies
- **Housing, Food, Allergies & Pets**: Preferences and restrictions
- **Dear Family Letter**: Formatted host family letter
- **Photos**: Placeholder for profile and family photos
- **Documents**: Comprehensive document list
- **Agreements**: Legal and permission documents
- **Vaccinations**: Medical requirement documents

## Customization

To modify the generator:

1. **Add Countries**: Extend the `COUNTRIES` object with new country data
2. **Add Names**: Include culturally appropriate first names and surnames
3. **Modify Activities**: Update `EXTRACURRICULAR_ACTIVITIES` and `HOBBIES` arrays
4. **Adjust Probabilities**: Change the Math.random() thresholds for different distributions
5. **Add Fields**: Extend the return object with additional student data

## Quality Assurance

The mock data ensures:
- **No Duplication**: Avoids existing student names and data
- **Cultural Accuracy**: Authentic names, locations, and cultural considerations
- **Realistic Relationships**: Logical connections between age, grade, proficiency
- **Comprehensive Coverage**: All sections of the application form are populated
- **Varied Distribution**: Good mix of backgrounds, interests, and characteristics
- **Professional Quality**: Suitable for development, testing, and demonstration

This mock data generator provides a robust foundation for testing SEVIS processing workflows with realistic, diverse student application data. 