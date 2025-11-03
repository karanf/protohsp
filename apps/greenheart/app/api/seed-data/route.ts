import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Simple validation to check if a string looks like SQL data
 */
function isValidSqlData(data: string): boolean {
  // Check basic SQL signature patterns
  return data.includes('INSERT INTO') && 
    (data.includes('INSERT INTO users') || 
     data.includes('INSERT INTO profiles') || 
     data.includes('INSERT INTO relationships'));
}

/**
 * API handler to serve the seed data SQL file
 */
export async function GET() {
  try {
    // Try different possible paths to find the seed data file
    const possiblePaths = [
      // Development path (monorepo structure)
      path.join(process.cwd(), '../../packages/database/src/schema/seed-data.sql'),
      // Alternative development path
      path.join(process.cwd(), '../packages/database/src/schema/seed-data.sql'),
      // Direct path for simpler setups
      path.join(process.cwd(), 'packages/database/src/schema/seed-data.sql'),
      // Fallback path
      path.join(process.cwd(), 'seed-data.sql'),
      // Try exact path for debugging
      '/Users/karan/Documents/EGAB/packages/database/src/schema/seed-data.sql'
    ];

    let filePath = '';
    let fileContent = '';

    // Try each path until we find the file
    for (const tryPath of possiblePaths) {
      try {
        if (fs.existsSync(tryPath)) {
          filePath = tryPath;
          fileContent = fs.readFileSync(tryPath, 'utf8');
          console.log(`Found seed data at: ${tryPath}`);
          break;
        }
      } catch (err) {
        console.log(`Path ${tryPath} not accessible`);
      }
    }

    if (!fileContent) {
      console.error('Could not find seed-data.sql file');
      
      // Return demo data for development/testing
      return NextResponse.json(
        { 
          success: true, 
          data: `
-- Demo SQL data for testing
-- Clean up existing data
DELETE FROM relationships;
DELETE FROM profiles;
DELETE FROM users;

-- Create demo users
INSERT INTO users (id, email, role, first_name, last_name, phone, avatar_url, status, metadata, created_at, updated_at) VALUES
('stud-m4juku', 'student.erik650@example.com', 'student', 'Erik', 'Hansson', '46-3458-63930', 'https://ui-avatars.com/api/?name=Erik+Hansson', 'active', '{"country_of_origin":"Sweden","age":13,"gender":"Male"}', NOW(), NOW()),
('stud-5tzk9n', 'student.yan313@example.com', 'student', 'Yan', 'Barbosa', '55-4896-26041', 'https://ui-avatars.com/api/?name=Yan+Barbosa', 'active', '{"country_of_origin":"Brazil","age":14,"gender":"Male"}', NOW(), NOW()),
('host-sq3kaf', 'smith.family@example.com', 'host_family', 'Michael', 'Smith', '202-136-2631', 'https://ui-avatars.com/api/?name=Michael+Smith', 'active', '{}', NOW(), NOW()),
('org-kib0y0', 'info@germanyexchange.org', 'sending_org', 'German', 'Student Exchange', '49-30-123-4567', 'https://ui-avatars.com/api/?name=German%20Student%20Exchange', 'active', '{"country":"Germany"}', NOW(), NOW());

-- Create demo profiles
INSERT INTO profiles (id, user_id, type, data, status, verified, created_at, updated_at) VALUES
('studp-aknekz', 'stud-m4juku', 'student', '{"gender":"Male","date_of_birth":"2010-05-14","country_of_origin":"Sweden","program":{"type":"semester_spring","name":"Spring Semester"},"school_grade":"8","sending_organization":"Sweden Abroad Program"}', 'active', true, NOW(), NOW()),
('studp-4j0kty', 'stud-5tzk9n', 'student', '{"gender":"Male","date_of_birth":"2009-06-23","country_of_origin":"Brazil","program":{"type":"academic_year","name":"Academic Year"},"school_grade":"9","sending_organization":"Brazilian Exchange Program"}', 'active', true, NOW(), NOW()),
('hostp-x66el6', 'host-sq3kaf', 'host_family', '{}', 'active', true, NOW(), NOW()),
('orgp-61qkrd', 'org-kib0y0', 'sending_org', '{"organization_name":"German Student Exchange","country":"Germany"}', 'active', true, NOW(), NOW());

-- Create demo relationships
INSERT INTO relationships (id, type, primary_id, secondary_id, status, start_date, data, created_at, updated_at) VALUES
('rel-86x3p2', 'host_student', 'hostp-x66el6', 'studp-aknekz', 'active', '2023-01-15', '{"placement_date":"2023-01-05","placement_status":"active","school_name":"Washington High School"}', NOW(), NOW()),
('rel-yiwoc4', 'sending_org_student', 'orgp-61qkrd', 'studp-aknekz', 'active', '2022-11-23', '{"program_type":"semester_spring","program_year":2023}', NOW(), NOW());
          `,
          is_demo: true
        }, 
        { status: 200 }
      );
    }

    // Validate SQL content
    if (!isValidSqlData(fileContent)) {
      console.error('Invalid SQL data format');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid SQL data format' 
        }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        data: fileContent 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error serving seed data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }, 
      { status: 500 }
    );
  }
} 