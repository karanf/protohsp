/**
 * SQL Seed Data Parser
 * 
 * This module provides utilities to parse raw SQL seed data into structured objects
 * for use in the application.
 */

// Define key data types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  metadata?: {
    country_of_origin?: string;
    gender?: string;
  };
  avatarUrl?: string;
}

export interface Profile {
  id: string;
  userId: string;
  type?: string;
  verified?: boolean;
  status?: string;
  data?: {
    date_of_birth?: string;
    gender?: string;
    school_grade?: string;
    program?: {
      type?: string;
    };
  };
}

export interface Relationship {
  id: string;
  type: string;
  primaryId: string;
  secondaryId: string;
  status: string;
  startDate?: string;
  endDate?: string;
  data?: {
    program_type?: string;
    partner_organization?: string;
    school_name?: string;
  };
}

// Regular expressions for parsing SQL data
const USER_REGEX = /INSERT INTO users \([^)]+\) VALUES\s+([^;]+);/g;
const PROFILE_REGEX = /INSERT INTO profiles \([^)]+\) VALUES\s+([^;]+);/g;
const RELATIONSHIP_REGEX = /INSERT INTO relationships \([^)]+\) VALUES\s+([^;]+);/g;

/**
 * Parse a user row from SQL
 * 
 * Example format: ('stud-m4juku', 'student.erik650@example.com', 'student', 'Erik', 'Hansson', '46-3458-63930', 'https://ui-avatars.com/api/?name=Erik+Hansson', 'active', '{"country_of_origin":"Sweden","age":13,"gender":"Male"}', NOW(), NOW())
 */
const parseUserRow = (row: string): User | null => {
  try {
    // Extract values from SQL row
    const matches = row.match(/\('([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)', [^,]+, [^)]+\)/);
    if (!matches || matches.length < 10) return null;

    // Parse metadata JSON
    let metadata = {};
    try {
      const metadataStr = matches[9] || '{}';
      
      // Use a safer approach: try to detect if it's already a JSON object
      if (metadataStr.startsWith('{') && metadataStr.endsWith('}')) {
        try {
          metadata = JSON.parse(metadataStr);
        } catch (e) {
          // If parsing fails, create a simple object manually
          console.warn("Could not parse metadata JSON directly, using manual extraction");
          
          // Manual parsing for simple key-value pairs
          const keyValuePairs = metadataStr.slice(1, -1).split(',');
          keyValuePairs.forEach(pair => {
            const [key, value] = pair.split(':').map(s => s.trim().replace(/"/g, ''));
            if (key && value) {
              // @ts-ignore
              metadata[key] = value;
            }
          });
        }
      } else {
        metadata = { raw_data: metadataStr };
      }
    } catch (e) {
      console.error("Failed to parse user metadata", e);
      metadata = {};
    }

    return {
      id: matches[1] || '',
      firstName: matches[4] || '',
      lastName: matches[5] || '',
      role: matches[3] || '',
      metadata
    };
  } catch (e) {
    console.error("Failed to parse user row", e);
    return null;
  }
};

/**
 * Parse a profile row from SQL
 * 
 * Example format: ('studp-aknekz', 'stud-m4juku', 'student', '{"gender":"Male","date_of_birth":"2010-05-14"...}', 'active', true, NOW(), NOW())
 */
const parseProfileRow = (row: string): Profile | null => {
  try {
    // Extract values from SQL row
    const matches = row.match(/\('([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)', (true|false), [^,]+, [^)]+\)/);
    if (!matches || matches.length < 7) return null;

    // Parse data JSON
    let data = {};
    try {
      const dataStr = matches[4] || '{}';
      
      // Use a safer approach: try to detect if it's already a JSON object
      if (dataStr.startsWith('{') && dataStr.endsWith('}')) {
        try {
          data = JSON.parse(dataStr);
        } catch (e) {
          // If parsing fails, create a simple object manually
          console.warn("Could not parse profile data JSON directly, using manual extraction");
          
          // Create a fallback data object
          data = {
            gender: dataStr.includes('"gender"') ? 
              dataStr.match(/"gender":"([^"]+)"/)?.at(1) || "Unknown" : "Unknown",
            date_of_birth: dataStr.includes('"date_of_birth"') ? 
              dataStr.match(/"date_of_birth":"([^"]+)"/)?.at(1) || null : null,
            country_of_origin: dataStr.includes('"country_of_origin"') ? 
              dataStr.match(/"country_of_origin":"([^"]+)"/)?.at(1) || null : null,
            school_grade: dataStr.includes('"school_grade"') ? 
              dataStr.match(/"school_grade":"([^"]+)"/)?.at(1) || null : null,
            raw_data: dataStr
          };
        }
      } else {
        data = { raw_data: dataStr };
      }
    } catch (e) {
      console.error("Failed to parse profile data", e);
      data = {};
    }

    return {
      id: matches[1] || '',
      userId: matches[2] || '',
      type: matches[3] || '',
      data,
      status: matches[5] || '',
      verified: matches[6] === 'true'
    };
  } catch (e) {
    console.error("Failed to parse profile row", e);
    return null;
  }
};

/**
 * Parse a relationship row from SQL
 * 
 * Example format: ('rel-yiwoc4', 'sending_org_student', 'orgp-61qkrd', 'studp-aknekz', 'active', '2022-11-23', '{"program_type":"semester_spring"...}', NOW(), NOW())
 */
const parseRelationshipRow = (row: string): Relationship | null => {
  try {
    // Extract values from SQL row
    const matches = row.match(/\('([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)', [^,]+, [^)]+\)/);
    if (!matches || matches.length < 8) return null;

    // Parse data JSON
    let data = {};
    try {
      const dataStr = matches[7] || '{}';
      
      // Use a safer approach: try to detect if it's already a JSON object
      if (dataStr.startsWith('{') && dataStr.endsWith('}')) {
        try {
          data = JSON.parse(dataStr);
        } catch (e) {
          // If parsing fails, extract key fields using regex
          console.warn("Could not parse relationship data JSON directly, using manual extraction");
          
          // Create a fallback data object with key fields extracted via regex
          data = {
            program_type: dataStr.includes('"program_type"') ? 
              dataStr.match(/"program_type":"([^"]+)"/)?.at(1) || null : null,
            program_year: dataStr.includes('"program_year"') ? 
              dataStr.match(/"program_year":(\d+)/)?.at(1) || null : null,
            placement_status: dataStr.includes('"placement_status"') ? 
              dataStr.match(/"placement_status":"([^"]+)"/)?.at(1) || null : null,
            school_name: dataStr.includes('"school_name"') ? 
              dataStr.match(/"school_name":"([^"]+)"/)?.at(1) || null : null,
            raw_data: dataStr
          };
        }
      } else {
        data = { raw_data: dataStr };
      }
    } catch (e) {
      console.error("Failed to parse relationship data", e);
      data = {};
    }

    return {
      id: matches[1] || '',
      type: matches[2] || '',
      primaryId: matches[3] || '',
      secondaryId: matches[4] || '',
      status: matches[5] || '',
      startDate: matches[6] || '',
      data
    };
  } catch (e) {
    console.error("Failed to parse relationship row", e);
    return null;
  }
};

/**
 * Parse SQL seed data and extract structured objects
 */
export function parseSeedData(data: any) {
  const users: User[] = data.users || [];
  const profiles: Profile[] = data.profiles || [];
  const relationships: Relationship[] = data.relationships || [];

  return {
    users,
    profiles,
    relationships
  };
} 