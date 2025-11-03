/**
 * Update Student Records with Reviewers and Acceptance Dates
 * 
 * This script adds:
 * 1. 'accepted_on' date for students with status other than 'pending_review'
 * 2. 'reviewed_by' field showing who accepted the student
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Load environment variables from .env.local
const envFile = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = '';
let supabaseServiceKey = '';

try {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    } else if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseServiceKey = line.split('=')[1].trim();
    }
  }
} catch (error) {
  console.error('Error reading .env.local file:', error);
  process.exit(1);
}

if (!supabaseUrl) {
  console.error('Supabase URL not found in .env.local');
  process.exit(1);
}

// Function to get service key from user input
function getServiceKeyFromUser() {
  return new Promise((resolve) => {
    rl.question('\nPlease enter your Supabase service_role key: ', (key) => {
      if (key && key.trim()) {
        resolve(key.trim());
      } else {
        console.log('Service key cannot be empty. Please try again.');
        resolve(getServiceKeyFromUser());
      }
    });
  });
}

// List of 10 reviewers
const REVIEWERS = [
  { id: '1', name: 'Sarah Johnson', position: 'Program Director' },
  { id: '2', name: 'Michael Chen', position: 'Application Specialist' },
  { id: '3', name: 'Aisha Patel', position: 'Enrollment Manager' },
  { id: '4', name: 'David Rodriguez', position: 'Regional Coordinator' },
  { id: '5', name: 'Emma Wilson', position: 'Student Affairs Officer' },
  { id: '6', name: 'James Thompson', position: 'Senior Advisor' },
  { id: '7', name: 'Maria Garcia', position: 'Admissions Director' },
  { id: '8', name: 'Robert Kim', position: 'International Officer' },
  { id: '9', name: 'Jennifer Singh', position: 'Program Coordinator' },
  { id: '10', name: 'Thomas Walker', position: 'Enrollment Specialist' }
];

// Helper function to get a random reviewer
const getRandomReviewer = () => REVIEWERS[Math.floor(Math.random() * REVIEWERS.length)];

// Helper function to get a date between two dates
const getDateBetween = (startDate, endDate) => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString().split('T')[0];
};

async function updateStudentRecords(serviceKey) {
  console.log(`Using Supabase URL: ${supabaseUrl}`);
  console.log('Connecting with service role key...');
  
  // Supabase connection with service role key
  const supabase = createClient(supabaseUrl, serviceKey);
  
  try {
    // Test connection
    const { data: testData, error: testError } = await supabase.from('profiles').select('count');
    if (testError) {
      console.error('Connection failed with provided service key:', testError);
      console.log('\nPlease check your service_role key and try again.');
      return false;
    }
    
    console.log('Connection successful!');
    console.log('Fetching student profiles...');
  
    // Get all student profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('type', 'student');
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return false;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('No student profiles found.');
      return true;
    }
    
    console.log(`Found ${profiles.length} student profiles`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Process each profile
    for (const profile of profiles) {
      // Skip if already has the fields or is pending review
      if (
        profile.data?.application?.status === 'pending_review' || 
        (profile.data?.accepted_on && profile.data?.reviewed_by)
      ) {
        skippedCount++;
        continue;
      }
      
      // Generate acceptance date (between created_at and updated_at)
      const acceptedOn = getDateBetween(profile.created_at, profile.updated_at);
      
      // Get random reviewer
      const reviewer = getRandomReviewer();
      
      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          data: {
            ...profile.data,
            accepted_on: acceptedOn,
            reviewed_by: reviewer
          }
        })
        .eq('id', profile.id);
      
      if (updateError) {
        console.error(`Error updating profile ${profile.id}:`, updateError);
      } else {
        updatedCount++;
        if (updatedCount % 50 === 0) {
          console.log(`Updated ${updatedCount} profiles so far...`);
        }
      }
    }
    
    console.log(`\nUpdate complete!`);
    console.log(`- Updated ${updatedCount} profiles`);
    console.log(`- Skipped ${skippedCount} profiles`);
    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
}

// Main execution function
async function main() {
  try {
    // If we don't have a service key in env file, ask for it
    if (!supabaseServiceKey) {
      console.log('\nNo service_role key found in .env.local');
      console.log('You need a service_role key to update data in Supabase.');
      console.log('\nTo get your service_role key:');
      console.log('1. Go to https://app.supabase.com/project/_/settings/api');
      console.log('2. Find the "service_role key (this is a secret!)" section');
      
      supabaseServiceKey = await getServiceKeyFromUser();
      
      // Optionally save to .env.local
      const saveToEnv = await new Promise((resolve) => {
        rl.question('Would you like to save this key to your .env.local file? (y/n): ', (answer) => {
          resolve(answer.toLowerCase() === 'y');
        });
      });
      
      if (saveToEnv) {
        try {
          let envContent = fs.readFileSync(envFile, 'utf8');
          const keyLine = `SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}`;
          
          if (envContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
            // Replace existing key
            envContent = envContent.replace(/SUPABASE_SERVICE_ROLE_KEY=.*$/m, keyLine);
          } else {
            // Add new key
            envContent += `\n${keyLine}\n`;
          }
          
          fs.writeFileSync(envFile, envContent);
          console.log('Service key saved to .env.local');
        } catch (err) {
          console.error('Failed to save key to .env.local:', err);
        }
      }
    }
    
    // Run the update function with the service key
    const success = await updateStudentRecords(supabaseServiceKey);
    
    if (!success) {
      // If initial update fails, try once more with manual key input
      console.log('\nLet\'s try again with a different service key.');
      supabaseServiceKey = await getServiceKeyFromUser();
      await updateStudentRecords(supabaseServiceKey);
    }
  } catch (err) {
    console.error('Script error:', err);
  } finally {
    rl.close();
    console.log('Script execution completed.');
  }
}

// Run the main function
main(); 