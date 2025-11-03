import dotenv from 'dotenv';
import path from 'path';

// Load .env files
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.local') });

import { init, tx, id } from '@instantdb/admin';

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

// Initialize InstantDB admin client
const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

interface StudentData {
  // Basic Info
  first_name?: string;
  last_name?: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  country_of_origin?: string;
  native_language?: string;
  english_proficiency?: string;
  
  // Academic Info
  school_grade?: string;
  gpa?: number;
  graduation_year?: number;
  academic_interests?: string[];
  academic_history?: any;
  
  // Personal Info
  student_bio?: string;
  bio?: string;
  personal_statement?: string;
  hobbies?: string[];
  favorite_activities?: string[];
  interests?: string[];
  
  // Health & Diet
  health?: any;
  health_info?: any;
  diet_restrictions?: string[];
  dietary_restrictions?: string;
  dietary_preferences?: string;
  religion?: string;
  
  // Program Info
  program?: any;
  program_dates?: any;
  arrival_date?: string;
  departure_date?: string;
  
  // Contact Info
  emergency_contact?: any;
  parents?: any[];
  home_address?: any;
  
  // Application Info
  application?: any;
  application_status?: string;
  
  // SEVIS Info
  sevis?: any;
  passport?: any;
  passport_number?: string;
  passport_expiry?: string;
  
  // Placement Info
  placement_preferences?: any;
  host_family_status?: string;
  
  // Additional fields that might exist
  [key: string]: any;
}

async function analyzeCompleteStudentData() {
  try {
    console.log('🔍 Analyzing complete student data in InstantDB...\n');

    // Get all student profiles
    const { profiles } = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });

    console.log(`📊 Found ${profiles.length} student profiles\n`);

    if (profiles.length === 0) {
      console.log('❌ No student profiles found');
      return;
    }

    // Analyze all fields across all students
    const allFields = new Set<string>();
    const fieldStats: Record<string, { count: number; examples: any[] }> = {};
    const missingFields: Record<string, number> = {};

    // Expected critical fields
    const criticalFields = [
      'first_name', 'last_name', 'email', 'date_of_birth', 'gender',
      'country_of_origin', 'native_language', 'english_proficiency',
      'school_grade', 'student_bio', 'bio', 'personal_statement',
      'hobbies', 'favorite_activities', 'interests', 'academic_interests',
      'health', 'health_info', 'diet_restrictions', 'dietary_restrictions',
      'program', 'program_dates', 'arrival_date', 'departure_date',
      'emergency_contact', 'parents', 'home_address', 'application',
      'sevis', 'passport', 'placement_preferences'
    ];

    profiles.forEach((profile, index) => {
      const data = profile.data as StudentData;
      
      // Collect all fields from this profile
      const collectFields = (obj: any, prefix = '') => {
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          Object.keys(obj).forEach(key => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            allFields.add(fullKey);
            
            if (!fieldStats[fullKey]) {
              fieldStats[fullKey] = { count: 0, examples: [] };
            }
            
            if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
              fieldStats[fullKey].count++;
              if (fieldStats[fullKey].examples.length < 3) {
                fieldStats[fullKey].examples.push(obj[key]);
              }
            }
            
            // Recursively collect nested fields
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              collectFields(obj[key], fullKey);
            }
          });
        }
      };

      collectFields(data);
      
      // Also check top-level profile fields
      ['email', 'firstName', 'lastName', 'isActive', 'verificationDate'].forEach(field => {
        const fullKey = `profile.${field}`;
        allFields.add(fullKey);
        
        if (!fieldStats[fullKey]) {
          fieldStats[fullKey] = { count: 0, examples: [] };
        }
        
        if (profile[field] !== null && profile[field] !== undefined && profile[field] !== '') {
          fieldStats[fullKey].count++;
          if (fieldStats[fullKey].examples.length < 3) {
            fieldStats[fullKey].examples.push(profile[field]);
          }
        }
      });
    });

    // Calculate missing field statistics
    criticalFields.forEach(field => {
      const count = fieldStats[field]?.count || 0;
      if (count < profiles.length) {
        missingFields[field] = profiles.length - count;
      }
    });

    // Sort fields by population rate
    const sortedFields = Array.from(allFields).sort((a, b) => {
      const aCount = fieldStats[a]?.count || 0;
      const bCount = fieldStats[b]?.count || 0;
      return bCount - aCount;
    });

    console.log('📈 FIELD POPULATION STATISTICS');
    console.log('================================\n');

    // Show well-populated fields
    console.log('✅ WELL-POPULATED FIELDS (>90% coverage):');
    sortedFields.forEach(field => {
      const stats = fieldStats[field];
      const percentage = ((stats?.count || 0) / profiles.length * 100).toFixed(1);
      if (parseFloat(percentage) > 90) {
        console.log(`   ${field}: ${stats?.count || 0}/${profiles.length} (${percentage}%)`);
        if (stats && stats.examples && stats.examples.length > 0) {
          console.log(`     Examples: ${stats.examples.slice(0, 2).map(ex => 
            typeof ex === 'string' ? `"${ex.substring(0, 50)}${ex.length > 50 ? '...' : ''}"` : 
            JSON.stringify(ex).substring(0, 50)
          ).join(', ')}`);
        }
      }
    });

    console.log('\n⚠️  PARTIALLY POPULATED FIELDS (10-90% coverage):');
    sortedFields.forEach(field => {
      const stats = fieldStats[field];
      const percentage = ((stats?.count || 0) / profiles.length * 100).toFixed(1);
      if (parseFloat(percentage) >= 10 && parseFloat(percentage) <= 90) {
        console.log(`   ${field}: ${stats?.count || 0}/${profiles.length} (${percentage}%)`);
        if (stats && stats.examples && stats.examples.length > 0) {
          console.log(`     Examples: ${stats.examples.slice(0, 2).map(ex => 
            typeof ex === 'string' ? `"${ex.substring(0, 50)}${ex.length > 50 ? '...' : ''}"` : 
            JSON.stringify(ex).substring(0, 50)
          ).join(', ')}`);
        }
      }
    });

    console.log('\n❌ MISSING OR SPARSE FIELDS (<10% coverage):');
    sortedFields.forEach(field => {
      const stats = fieldStats[field];
      const percentage = ((stats?.count || 0) / profiles.length * 100).toFixed(1);
      if (parseFloat(percentage) < 10) {
        console.log(`   ${field}: ${stats?.count || 0}/${profiles.length} (${percentage}%)`);
        if (stats && stats.examples && stats.examples.length > 0) {
          console.log(`     Examples: ${stats.examples.slice(0, 2).map(ex => 
            typeof ex === 'string' ? `"${ex.substring(0, 50)}${ex.length > 50 ? '...' : ''}"` : 
            JSON.stringify(ex).substring(0, 50)
          ).join(', ')}`);
        }
      }
    });

    console.log('\n🎯 CRITICAL MISSING FIELDS ANALYSIS');
    console.log('====================================\n');

    if (Object.keys(missingFields).length === 0) {
      console.log('✅ All critical fields are fully populated!');
    } else {
      Object.entries(missingFields)
        .sort(([,a], [,b]) => b - a)
        .forEach(([field, missing]) => {
          const percentage = ((profiles.length - missing) / profiles.length * 100).toFixed(1);
          console.log(`❌ ${field}: ${missing} missing (${percentage}% populated)`);
        });
    }

    // Sample detailed data from first few students
    console.log('\n📋 SAMPLE STUDENT PROFILES (First 3)');
    console.log('=====================================\n');

    profiles.slice(0, 3).forEach((profile, index) => {
      console.log(`Student ${index + 1} (ID: ${profile.id}):`);
      console.log(`  Profile Email: ${profile.email || 'MISSING'}`);
      console.log(`  Profile Name: ${profile.firstName} ${profile.lastName}`);
      
      const data = profile.data as StudentData;
      console.log(`  Data Email: ${data.email || 'MISSING'}`);
      console.log(`  Data Name: ${data.first_name} ${data.last_name}`);
      console.log(`  Bio: ${data.student_bio?.substring(0, 100) || data.bio?.substring(0, 100) || 'MISSING'}...`);
      console.log(`  Activities: ${JSON.stringify(data.favorite_activities || data.hobbies || data.interests || 'MISSING')}`);
      console.log(`  Health: ${data.health ? 'Present' : data.health_info ? 'Present' : 'MISSING'}`);
      console.log(`  Program: ${data.program ? 'Present' : 'MISSING'}`);
      console.log(`  SEVIS: ${data.sevis ? 'Present' : 'MISSING'}`);
      console.log('  ---');
    });

    console.log('\n🔍 TOTAL FIELDS DISCOVERED');
    console.log('===========================');
    console.log(`Total unique fields found: ${allFields.size}`);
    console.log(`\nAll fields:`);
    Array.from(allFields).sort().forEach(field => {
      const stats = fieldStats[field];
      const percentage = ((stats?.count || 0) / profiles.length * 100).toFixed(1);
      console.log(`  ${field} (${percentage}%)`);
    });

  } catch (error) {
    console.error('❌ Error analyzing student data:', error);
    throw error;
  }
}

// Run the analysis
if (require.main === module) {
  analyzeCompleteStudentData()
    .then(() => {
      console.log('\n✅ Student data analysis complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Analysis failed:', error);
      process.exit(1);
    });
}

export { analyzeCompleteStudentData }; 