/**
 * Mock Data Generator for Student Exchange Program
 * 
 * This script generates realistic mock data for:
 * - Students
 * - Host Families
 * - Local Coordinators
 * - Sending Organizations
 * 
 * The data is formatted for easy import into Supabase.
 */

const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

// Config
const NUM_STUDENTS = 826;
const NUM_HOST_FAMILIES = 200;
const NUM_COORDINATORS = 50;
const NUM_SENDING_ORGS = 25;

// Student status distribution
const STUDENT_STATUS_DISTRIBUTION = {
  'pending_review': 0.30,  // 30% - Students New To the System
  'accepted': 0.20,        // 20% - Accepted into the system
  'ready_for_sevis': 0.05, // 5% - Ready for SEVIS Batching
  'pending_sevis': 0.10,   // 10% - Pending SEVIS
  'submitted_to_sevis': 0.05, // 5% - Submitted to SEVIS
  'sevis_approved': 0.25,  // 25% - SEVIS Approved
  'sevis_rejected': 0.05   // 5% - SEVIS Rejected
};

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

// Utilities
const generateId = () => {
  // Generate a valid UUID v4
  return faker.string.uuid();
};
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomItems = (arr, min = 1, max = 3) => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const result = [];
  const copy = [...arr];
  for (let i = 0; i < count; i++) {
    if (copy.length === 0) break;
    const index = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
};

// Reference Data
const COUNTRIES = [
  { code: 'DE', name: 'Germany', language: 'German' },
  { code: 'ES', name: 'Spain', language: 'Spanish' },
  { code: 'FR', name: 'France', language: 'French' },
  { code: 'IT', name: 'Italy', language: 'Italian' },
  { code: 'JP', name: 'Japan', language: 'Japanese' },
  { code: 'CN', name: 'China', language: 'Chinese' },
  { code: 'BR', name: 'Brazil', language: 'Portuguese' },
  { code: 'MX', name: 'Mexico', language: 'Spanish' },
  { code: 'KR', name: 'South Korea', language: 'Korean' },
  { code: 'SE', name: 'Sweden', language: 'Swedish' },
  { code: 'NL', name: 'Netherlands', language: 'Dutch' },
  { code: 'TH', name: 'Thailand', language: 'Thai' },
  { code: 'VN', name: 'Vietnam', language: 'Vietnamese' },
  { code: 'TR', name: 'Turkey', language: 'Turkish' },
  { code: 'PL', name: 'Poland', language: 'Polish' }
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const PROGRAMS = [
  { id: 'academic_year', name: 'Academic Year', duration: 10 },
  { id: 'semester_fall', name: 'Semester (Fall)', duration: 5 },
  { id: 'semester_spring', name: 'Semester (Spring)', duration: 5 },
  { id: 'calendar_year', name: 'Calendar Year', duration: 12 },
  { id: 'summer', name: 'Summer Program', duration: 2 }
];

const GRADES = ['9', '10', '11', '12'];
const STATUSES = ['active', 'pending', 'approved', 'inactive', 'rejected'];
const RELATIONSHIP_STATUSES = ['pending', 'active', 'inactive', 'terminated'];

// Additional Reference Data
const ENGLISH_TEST_SCORES = {
  SLEP: { min: 30, max: 85 },
  ELTIS: { min: 350, max: 710 }
};

const GPA_SCALES = ['4.0', '3.5', '3.0', '2.5', '2.0'];
const GRADUATION_YEARS = ['2024', '2025', '2026', '2027', '2028'];
const FAVORITE_ACTIVITIES = [
  "Playing soccer with my friends on weekends has been a passion since I was a child. I love the team spirit and camaraderie that develops on the field. As a midfielder, I enjoy contributing to both defense and attack, reading the game, and setting up scoring opportunities for my teammates. The physical exercise keeps me fit and helps me release stress after a week of studying. I particularly enjoy the post-game discussions where we analyze our performance and plan strategies for future matches.",
  
  "Learning to play guitar has been a rewarding journey that I started three years ago. I practice daily, working on both technical exercises and songs I love. Folk and rock music are my favorite genres to play, and I\'ve recently started writing my own compositions. There\'s something deeply satisfying about mastering a difficult song after weeks of practice. I also enjoy performing at small gatherings of friends and family, sharing the joy of music with others.",
  
  "Reading science fiction novels transports me to different worlds and makes me think about the future of humanity and technology. I\'m fascinated by authors like Isaac Asimov, Philip K. Dick, and Ursula K. Le Guin who explore philosophical questions through their stories. I typically read for at least an hour before bed each night, and I keep a journal of my favorite quotes and ideas from these books. Discussing these books with friends has led to some of the most thought-provoking conversations I\'ve had.",
  
  "Hiking in the mountains with my family brings me closer to nature and provides an escape from the digital world. We try to explore different trails each month, challenging ourselves with increasingly difficult routes. I love the physical challenge of ascending steep paths and the reward of breathtaking views at the summit. During these hikes, I\'ve developed an interest in local flora and fauna, often photographing interesting plants and animals we encounter along the way.",
  
  "Cooking traditional dishes from my country connects me to my cultural heritage and brings joy to people around me. My grandmother taught me many recipes that have been passed down through generations. I enjoy the process of preparing ingredients, combining flavors, and presenting the final dish in an appealing way. There\'s something magical about recreating the tastes of home and sharing them with people who may never have experienced these flavors before. I find it\'s also a wonderful way to deal with homesickness when I\'m away from my family."
];

// Additional favorite activities to split the array and reduce linter errors
const FAVORITE_ACTIVITIES_2 = [
  "Playing chess in my school\'s chess club has taught me strategic thinking and patience. I\'ve participated in several local tournaments, gradually improving my rating with each competition. The mental challenge of anticipating my opponent\'s moves and developing long-term strategies on the board is incredibly satisfying. Chess has also introduced me to friends from various backgrounds who share this passion. I enjoy studying famous games from chess masters and trying to understand their thinking process.",
  
  "Swimming and water sports have been central to my life since I was young. I\'m on my school\'s swim team and practice three times a week, constantly working to improve my technique and speed. The feeling of gliding through water provides both exhilaration and tranquility. Beyond competitive swimming, I enjoy various water activities like snorkeling, water polo, and surfing when possible. These activities have taught me discipline, the importance of proper breathing techniques, and an appreciation for aquatic environments.",
  
  "Learning computer programming began as a hobby but has grown into a serious interest over the past few years. I\'ve created small games and apps that solve practical problems in daily life. The logical thinking required for coding has helped me develop a structured approach to problem-solving in other areas. I enjoy the creative aspects of designing user interfaces and the satisfaction of debugging a stubborn error. Working on collaborative coding projects has also taught me valuable teamwork skills and version control practices.",
  
  "Volunteering at a local animal shelter has been one of the most rewarding experiences in my life. I help take care of abandoned pets, cleaning their enclosures, providing food and water, and giving them much-needed attention and affection. Seeing an animal\'s personality emerge as they become more comfortable with human interaction is incredibly fulfilling. I\'ve learned about animal behavior, basic veterinary care, and the importance of responsible pet ownership. This experience has strengthened my commitment to animal welfare and conservation efforts.",
  
  "Drawing and painting landscapes allows me to capture the beauty of the world around me. I especially enjoy using watercolors for their fluidity and unpredictable nature. Each painting session is a form of meditation where I focus entirely on colors, shapes, and textures. I\'ve filled several sketchbooks with scenes from my neighborhood and places I\'ve visited. Over time, I\'ve developed my own style and technique, experimenting with different papers, brushes, and color palettes. Sharing my artwork online has connected me with other artists who provide feedback and inspiration."
];

// Third set of favorite activities
const FAVORITE_ACTIVITIES_3 = [
  "Dancing to traditional and modern music has been my way of expressing emotions and staying active. I\'ve been taking dance classes for five years, learning various styles from ballet to hip-hop. The discipline required for mastering complex choreographies has taught me perseverance and attention to detail. Dance performances have helped me overcome stage fright and build confidence. I also enjoy the cultural aspects of traditional dances, learning about their history and significance in different societies.",
  
  "Baking pastries and desserts started as helping my mother in the kitchen and evolved into my creative outlet. I love experimenting with different recipes, incorporating ingredients from various culinary traditions. The precision required in baking has improved my organizational skills and patience. There\'s something magical about transforming simple ingredients into a delicious treat that brings joy to others. I enjoy the challenges of difficult techniques like laminated dough and sugar work, always pushing myself to learn new skills.",
  
  "Playing basketball with my school team has been central to my high school experience. We won the regional championship last year after months of intensive training and team-building exercises. As a point guard, I value the strategic elements of the game and the responsibility of coordinating plays on the court. Basketball has taught me the importance of communication, quick decision-making, and resilience when facing stronger opponents. The friendships formed through shared victories and defeats are some of the strongest in my life.",
  
  "Practicing photography allows me to see the world differently, noticing details and compositions that others might miss. I like taking pictures of nature and architecture, capturing moments of beauty in everyday scenes. Learning about lighting, composition, and post-processing has been a continuous journey of improvement. Photography has taught me patience - sometimes waiting hours for the perfect light or wildlife moment. I enjoy reviewing my portfolio and seeing how my eye and technique have developed over time.",
  
  "Writing short stories and poetry gives me an outlet for my imagination and emotions. I\'ve been published in my school\'s literary magazine and received encouraging feedback from my teachers and peers. Creating characters and plots allows me to explore different perspectives and ethical dilemmas in a safe space. I keep a daily journal to practice my writing skills and document my thoughts. Literary contests and writing workshops have pushed me to refine my style and accept constructive criticism."
];

// Additional activities from the JSON file for even more variety
const FAVORITE_ACTIVITIES_4 = [
  "Participating in debate competitions and public speaking events. I\'ve represented my school at regional and national levels, developing strong research and argumentation skills. Debate has taught me to think critically about complex issues, consider multiple perspectives, and present my ideas persuasively. I enjoy the intellectual challenge of preparing arguments on a wide range of topics, from environmental policy to economic systems. Public speaking was initially intimidating, but with practice, I\'ve gained confidence and learned to engage audiences effectively. These communication skills will be valuable throughout my life, regardless of my future career path.",
  
  "Practicing yoga and meditation daily. I started three years ago to help manage stress during exam periods, but it has become a central part of my life and personal philosophy. Yoga has improved my physical strength, flexibility, and balance, while meditation has enhanced my mental focus and emotional regulation. I\'ve learned various breathing techniques that help me stay calm in challenging situations. This practice has made me more mindful and present in my daily activities, allowing me to appreciate simple moments more fully. I try to approach difficulties with patience and a balanced perspective, which I believe will help me adapt to life in a new country.",
  
  "Studying astronomy and observing celestial events. My interest began when my parents gave me a small telescope for my birthday four years ago. Since then, I\'ve joined an astronomy club and participated in stargazing events in remote areas away from city lights. I\'ve learned to identify constellations, planets, and other celestial objects, and I keep a log of my observations. The vastness of the universe fascinates me and puts our daily concerns into perspective. I\'ve given presentations about space exploration at my school and tried to share my enthusiasm with younger students. Learning about different cultural interpretations of the night sky has shown me how humanity shares the same cosmic wonder across time and geography.",
  
  "Practicing martial arts, specifically Taekwondo, for the past six years. I\'ve earned a black belt and now help instruct younger students at my dojang. Martial arts has taught me discipline, respect, and the importance of consistent practice to develop skills. Beyond the physical techniques, I\'ve embraced the philosophy of using strength responsibly and avoiding conflict when possible. The training involves both individual forms and partner exercises, balancing personal achievement with cooperation. Preparing for belt tests has taught me to set goals and work systematically toward them, even when progress seems slow. I\'ve competed in several tournaments, which has built my confidence and ability to perform under pressure.",
  
  "Participating in community theater productions. I\'ve been acting in plays since middle school and have taken on increasingly challenging roles over the years. Theatre requires me to step outside myself and understand characters with different perspectives and life experiences. Memorizing lines and working with directors has improved my language skills and ability to accept constructive criticism. The collaborative nature of theater production, where everyone from actors to stage crew must work together to create a successful show, has taught me valuable teamwork skills. I particularly enjoy the historical research involved in preparing for period pieces. Performing for audiences has helped me overcome stage fright and develop presence and projection.",
  
  "Creating digital art and animations using graphic design software. What started as a hobby has developed into a serious pursuit where I blend traditional artistic techniques with digital tools. I\'ve completed several online courses to improve my skills and am constantly learning new techniques from tutorials and forums. My style combines elements from both my cultural background and contemporary digital art trends. I\'ve created logos for student clubs and illustrated stories for younger students at my school. Working on digital projects has taught me the importance of both technical precision and creative vision. I enjoy the problem-solving aspects of design, finding ways to communicate ideas visually in the most effective way.",
  
  "Researching and documenting local history in my hometown. I\'ve always been fascinated by the stories of how my community developed over generations. For the past two years, I\'ve been interviewing elderly residents and collecting their memories before they\'re lost to time. I\'ve created a digital archive of photographs, recordings, and written accounts that tell the story of our changing town. This project has taught me research skills, interview techniques, and how to organize information effectively. I\'ve learned that history isn\'t just in textbooks but in the lived experiences of ordinary people. The older residents I\'ve spoken with appreciate having their stories preserved and valued. My work has been recognized by our local historical society, and I\'ve given presentations to community groups about my findings.",
  
  "Studying and performing classical and folk music from my country. I play multiple traditional instruments and have performed at cultural festivals throughout my region. Learning these musical traditions has deepened my connection to my heritage and given me a greater appreciation for the artistic achievements of previous generations. I practice for several hours each day, working to master complex techniques and performance styles. Playing this music has taught me the value of cultural preservation while also allowing for individual expression within traditional forms. I often collaborate with other young musicians to create new arrangements that respect tradition while introducing contemporary elements. I hope to share these musical traditions with American audiences during my exchange year.",
  
  "Volunteering with an organization that provides educational support to children from disadvantaged backgrounds. For the past three years, I\'ve spent weekends tutoring students in mathematics and science, helping them develop confidence in subjects they find challenging. Seeing these children make progress and develop enthusiasm for learning has been incredibly rewarding. Through this work, I\'ve learned to explain complex concepts in simple terms and to adapt my teaching approach to different learning styles. I\'ve also gained insight into the social and economic factors that create educational inequality. The experience has strengthened my communication skills and ability to connect with people from diverse backgrounds. This volunteer work has confirmed my interest in possibly pursuing a career in education or social service."
];

// Combine all favorite activities for access in the code
const ALL_FAVORITE_ACTIVITIES = [
  ...FAVORITE_ACTIVITIES,
  ...FAVORITE_ACTIVITIES_2,
  ...FAVORITE_ACTIVITIES_3,
  ...FAVORITE_ACTIVITIES_4
];

const STUDENT_BIOS = [
  "I\'m an enthusiastic and curious student who loves learning about different cultures and ways of life. From a young age, I\'ve dreamed of studying abroad to improve my English and experience daily life in America. Growing up in a small town has made me eager to experience different environments and educational systems. I enjoy team sports and make friends easily, valuing diverse perspectives and experiences. My teachers describe me as adaptable and respectful of different opinions and lifestyles. I believe that this exchange program will be a transformative experience that will broaden my horizons and prepare me for an increasingly interconnected world.",
  
  "As the oldest child in my family, I\'ve learned responsibility and leadership from an early age, helping care for my younger siblings while maintaining excellent academic performance. This balance has taught me time management and prioritization skills that will serve me well during my exchange year. I\'m passionate about science and technology, spending much of my free time on experiments and coding projects. My goal is to study engineering in the future, possibly specializing in renewable energy solutions. I\'m particularly excited to experience the American education system with its emphasis on practical applications and extracurricular activities not available in my home country."
];

// Additional student bios to split the array and reduce linter errors
const STUDENT_BIOS_2 = [
  "My teachers describe me as hardworking, creative, and always willing to help others. Literature and languages have always fascinated me - I\'ve been learning English since I was six and have recently started studying French as well. Understanding different languages opens windows to new cultures and ways of thinking. I\'m also a good cook, having learned traditional recipes from both my grandmothers, and I enjoy sharing my culture through food. Music is another passion - I play the violin in our school orchestra. I\'m looking forward to learning about American traditions firsthand while sharing aspects of my own culture with my host family.",
  
  "I\'m an active and outgoing person who thrives in social settings and enjoys outdoor activities and sports. Staying physically active helps me maintain mental clarity and emotional balance during demanding academic periods. I\'m particularly interested in environmental issues and volunteer for local clean-up projects and conservation efforts. This has taught me the importance of community involvement and taking action on global issues at a local level. I\'m excited to experience American high school life, participate in clubs and sports teams, and make lifelong friendships with my host family and classmates. I believe these connections will enrich my life long after the exchange program ends."
];

// Third set of student bios
const STUDENT_BIOS_3 = [
  "Music has been central to my life since I was very young - I play the piano and sing in my school choir, participating in national competitions and community performances. These experiences have taught me discipline, teamwork, and how to perform under pressure. Alongside my artistic pursuits, I\'m also interested in mathematics and hope to pursue studies in this field, possibly combining it with music theory or acoustics. I\'m known for being adaptable, respectful, and eager to learn about new cultures and perspectives. Though I expect challenges during my exchange year, I believe it will help me grow as a person and develop independence while broadening my academic and cultural horizons."
];

// Combine all student bios for access in the code
const ALL_STUDENT_BIOS = [
  ...STUDENT_BIOS,
  ...STUDENT_BIOS_2,
  ...STUDENT_BIOS_3
];

const SPECIAL_REQUESTS = [
  ['CA', 'NY', 'FL'],
  ['WA', 'OR', 'CO'],
  ['TX', 'AZ', 'NM'],
  ['MA', 'CT', 'RI'],
  ['IL', 'MI', 'WI'],
  ['No preference'],
  ['Near beach', 'Coastal area'],
  ['Near mountains', 'Hiking areas'],
  ['Major city', 'Urban area'],
  ['Rural area', 'Small town']
];

const PET_PREFERENCES = [
  'No pets',
  'Likes all pets',
  'Prefers dogs',
  'Prefers cats',
  'No large dogs',
  'Only small pets',
  'Allergic to cats',
  'Allergic to dogs'
];

const LOCATION_PREFERENCES = [
  'Urban',
  'Suburban',
  'Rural',
  'Any',
  'Near coast',
  'Near mountains',
  'Near large city',
  'Warm climate',
  'Cold climate'
];

const FAMILY_PREFERENCES = [
  'Any family type',
  'Family with children',
  'Family with teenagers',
  'Quiet household',
  'Active family',
  'Musical family',
  'Sports-oriented family',
  'No preference'
];

// Additional Reference Data for Host Families
const HOST_FAMILY_BIOS = [
  "We're an active family that loves outdoor activities like hiking and biking. We've always been interested in other cultures and are excited to share our home with an exchange student. We have two teenagers who are looking forward to having an international 'sibling'.",
  "Our family enjoys cooking together and trying foods from around the world. We live in a quiet neighborhood with good schools nearby. We've hosted exchange students twice before and found it to be a rewarding experience for everyone.",
  "We're a musical family - both parents are music teachers and our children play instruments. We enjoy attending concerts and local events together. We're looking forward to sharing American traditions while learning about another culture.",
  "We're an empty-nester couple with grown children who have moved out. We have a spacious home with plenty of room and would love to provide a welcoming environment for a student. We both work from home and can provide good supervision and support.",
  "As a multicultural family ourselves, we understand the challenges of adapting to a new culture. We're patient, supportive, and eager to help a student feel at home while experiencing American life. We speak both English and Spanish at home."
];

const HOME_AMENITIES = [
  'Dedicated study space',
  'High-speed internet',
  'Computer/laptop access',
  'Bicycle available for student use',
  'Swimming pool',
  'Piano/musical instruments',
  'Game room/entertainment area',
  'Quiet reading area',
  'Gym equipment',
  'Garden/outdoor space',
  'Basketball hoop',
  'Close to public transportation',
  'Close to park/recreational area'
];

const RELIGIOUS_AFFILIATIONS = [
  'Christian - Protestant',
  'Christian - Catholic',
  'Jewish',
  'Muslim',
  'Hindu',
  'Buddhist',
  'Unitarian',
  'Agnostic',
  'Atheist',
  'Spiritual but not religious',
  'None',
  'Other'
];

const COMMUNITY_DESCRIPTIONS = [
  'Suburban neighborhood with good schools and parks',
  'Rural area with lots of outdoor activities',
  'Small town with tight-knit community',
  'Urban neighborhood with cultural amenities',
  'Coastal community with beach access',
  'Mountain town with hiking and skiing',
  'College town with educational opportunities',
  'Historic district with lots of character',
  'Planned community with recreational facilities'
];

const HOSTING_MOTIVATIONS = [
  'We want to provide a cultural exchange experience for our family',
  'We enjoy learning about different cultures and perspectives',
  'We want our children to have an international friendship',
  'We\'ve had positive experiences hosting in the past',
  'We enjoy mentoring young people',
  'We want to share American culture and traditions',
  'We have extra space in our home and want to put it to good use',
  'We want to maintain international connections',
  'Friends recommended hosting as a rewarding experience'
];

const FAMILY_ACTIVITIES = [
  'Family dinners together most evenings',
  'Weekend outdoor activities (hiking, biking, sports)',
  'Regular movie or game nights',
  'Attending local cultural events and festivals',
  'Church/religious services attendance',
  'Community volunteer work',
  'Sports events (watching or participating)',
  'Travel during school breaks',
  'Cooking and baking together',
  'Visiting museums and historical sites',
  'Camping trips',
  'Holiday celebrations and traditions'
];

const STUDENT_EXPECTATIONS = [
  'Participate in family activities',
  'Help with household chores',
  'Maintain good academic standing',
  'Communicate openly about needs and concerns',
  'Follow house rules and curfews',
  'Share about their culture and customs',
  'Be respectful of family members and property',
  'Limit screen time/phone use during family time',
  'Join family for meals when possible'
];

const HOUSE_RULES = [
  'Curfew on school nights',
  'Limited screen time',
  'Help with household chores',
  'No smoking/vaping/alcohol',
  'Notify family of schedule changes',
  'Respect quiet hours',
  'Ask before inviting friends over',
  'Keep bedroom and bathroom clean',
  'Join for family dinners',
  'Use of shared spaces'
];

const SMOKER_STATUSES = ['Non-smoking household', 'Outdoor smoking only', 'Some family members smoke'];
const DRINKER_STATUSES = ['Non-drinking household', 'Occasional/moderate drinking', 'Regular social drinking'];

// Generate data
const users = [];
const profiles = [];
const relationships = [];

// 1. Generate Sending Organizations
console.log('Generating sending organizations...');
const sendingOrgs = [];
const sendingOrgProfiles = [];

for (let i = 0; i < NUM_SENDING_ORGS; i++) {
  const country = randomItem(COUNTRIES);
  const id = generateId();
  const profileId = generateId();
  
  const name = faker.company.name() + ' ' + randomItem(['Exchange', 'Students', 'Education', 'International']);
  const email = faker.internet.email({ firstName: name.split(' ')[0].toLowerCase(), lastName: 'org', provider: 'example.com' });
  
  users.push({
    id,
    email,
    role: 'sending_org',
    first_name: name.split(' ')[0],
    last_name: name.split(' ').slice(1).join(' '),
    phone: faker.phone.number(),
    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
    status: 'active',
    metadata: { country: country.name },
    created_at: faker.date.past({ years: 2 }),
    updated_at: faker.date.recent()
  });
  
  profiles.push({
    id: profileId,
    user_id: id,
    type: 'sending_org',
    data: {
      organization_name: name,
      country: country.name,
      website: faker.internet.url(),
      contact_email: email,
      contact_phone: faker.phone.number(),
      description: faker.company.catchPhrase(),
      year_established: faker.date.between({ from: '1980-01-01', to: '2010-01-01' }).getFullYear(),
      programs_offered: randomItems(PROGRAMS).map(p => p.id),
      students_per_year: faker.number.int({ min: 20, max: 500 }),
      partner_since: faker.date.between({ from: '2010-01-01', to: '2022-01-01' }).getFullYear(),
      languages: [country.language, 'English']
    },
    status: 'active',
    verified: true,
    created_at: faker.date.past({ years: 2 }),
    updated_at: faker.date.recent()
  });
  
  sendingOrgs.push({ id, profileId, country: country.name, name });
  sendingOrgProfiles.push(profileId);
}

// 2. Generate Local Coordinators
console.log('Generating local coordinators...');
const coordinators = [];
const coordinatorProfiles = [];

for (let i = 0; i < NUM_COORDINATORS; i++) {
  const id = generateId();
  const profileId = generateId();
  const state = randomItem(US_STATES);
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName, provider: 'example.com' });
  
  users.push({
    id,
    email,
    role: 'coordinator',
    first_name: firstName,
    last_name: lastName,
    phone: faker.phone.number(),
    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName+'+'+lastName)}`,
    status: 'active',
    metadata: { state },
    created_at: faker.date.past({ years: 2 }),
    updated_at: faker.date.recent()
  });
  
  profiles.push({
    id: profileId,
    user_id: id,
    type: 'coordinator',
    data: {
      address: faker.location.streetAddress() + ', ' + faker.location.city() + ', ' + state,
      background_check_date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
      training_completed: true,
      training_date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
      state,
      regions_covered: [faker.location.city() + ' area', faker.location.city() + ' county'],
      years_experience: faker.number.int({ min: 1, max: 15 }),
      languages: ['English'].concat(Math.random() > 0.7 ? [randomItem(COUNTRIES).language] : []),
      max_students: faker.number.int({ min: 5, max: 20 }),
      preferred_contact_method: randomItem(['email', 'phone', 'text'])
    },
    status: 'active',
    verified: true,
    created_at: faker.date.past({ years: 2 }),
    updated_at: faker.date.recent()
  });
  
  coordinators.push({ id, profileId, state });
  coordinatorProfiles.push(profileId);
}

// 3. Generate Host Families
console.log('Generating host families...');
const hostFamilies = [];
const hostFamilyProfiles = [];

for (let i = 0; i < NUM_HOST_FAMILIES; i++) {
  const id = generateId();
  const profileId = generateId();
  const state = randomItem(US_STATES);
  const city = faker.location.city();
  const lastName = faker.person.lastName();
  const firstName = faker.person.firstName();
  const email = faker.internet.email({ firstName, lastName, provider: 'example.com' });
  
  users.push({
    id,
    email,
    role: 'host_family',
    first_name: firstName,
    last_name: lastName,
    phone: faker.phone.number(),
    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName+'+'+lastName)}`,
    status: 'active',
    metadata: { family_name: lastName },
    created_at: faker.date.past({ years: 2 }),
    updated_at: faker.date.recent()
  });
  
  const hasPets = Math.random() > 0.5;
  const pets = hasPets ? {
    has_pets: true,
    pets: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
      type: randomItem(['dog', 'cat', 'bird', 'fish']),
      count: faker.number.int({ min: 1, max: 3 })
    }))
  } : { has_pets: false };
  
  const familyMembers = Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => ({
    relation: randomItem(['father', 'mother', 'son', 'daughter', 'grandfather', 'grandmother']),
    name: faker.person.fullName(),
    age: faker.number.int({ min: 5, max: 70 })
  }));
  
  // Enhanced family members with more details
  const enhancedFamilyMembers = familyMembers.map(member => {
    return {
      ...member,
      occupation: member.age > 18 ? faker.person.jobTitle() : 'Student',
      education: member.age > 22 ? randomItem(['High School', 'Some College', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate']) : 'In School',
      interests: randomItems(['Sports', 'Music', 'Art', 'Reading', 'Cooking', 'Travel', 'Technology', 'Outdoors', 'Gaming'], 1, 3),
      languages: ['English'].concat(Math.random() > 0.7 ? [randomItem(COUNTRIES).language] : []),
      allergies: Math.random() > 0.8 ? randomItems(['peanuts', 'dairy', 'gluten', 'shellfish', 'pollen', 'cats', 'dogs'], 0, 1) : [],
      role_in_hosting: member.age > 15 ? randomItem(['Primary contact', 'Secondary contact', 'Support person', 'Shared activities', 'Occasional involvement']) : 'Family member'
    };
  });
  
  // Generate home neighborhood information
  const neighborhood = {
    description: randomItem(COMMUNITY_DESCRIPTIONS),
    school_distance: faker.number.int({ min: 1, max: 15 }) + ' miles',
    school_transportation: randomItem(['School bus', 'Public transportation', 'Family provides transportation', 'Walking distance']),
    amenities_nearby: randomItems(['Parks', 'Libraries', 'Shopping centers', 'Movie theaters', 'Sports facilities', 'Community center', 'Restaurants', 'Churches'], 2, 5),
    safety: randomItem(['Very safe', 'Generally safe', 'Average', 'Safe during daytime']),
    community_type: randomItem(['Suburban', 'Urban', 'Rural', 'Small town'])
  };
  
  // Generate application and hosting information
  const hostingInfo = {
    motivation: randomItem(HOSTING_MOTIVATIONS),
    preferred_student_gender: Math.random() > 0.7 ? randomItem(['Male', 'Female']) : 'No preference',
    preferred_student_age: randomItem(['14-15', '16-17', '17-18', 'Any age']),
    preferred_student_interests: randomItems(['Sports', 'Music', 'Arts', 'Academics', 'Outdoors', 'Technology'], 0, 3),
    preferred_program_length: randomItem(['Semester', 'Academic year', 'Calendar year', 'Summer program', 'Any']),
    willing_to_host_multiple: Math.random() > 0.8,
    application_date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
    application_status: randomItem(['applied', 'under_review', 'background_check', 'home_visit_scheduled', 'approved', 'active']),
    years_at_current_address: faker.number.int({ min: 1, max: 20 }),
    previous_addresses: Math.random() > 0.7 ? [{
      address: faker.location.streetAddress() + ', ' + faker.location.city() + ', ' + randomItem(US_STATES),
      years: faker.number.int({ min: 1, max: 10 })
    }] : []
  };
  
  // Generate household information
  const householdInfo = {
    primary_language: 'English',
    other_languages: Math.random() > 0.3 ? [randomItem(COUNTRIES).language] : [],
    smoker_status: randomItem(SMOKER_STATUSES),
    drinker_status: randomItem(DRINKER_STATUSES),
    religious_affiliation: randomItem(RELIGIOUS_AFFILIATIONS),
    religious_participation: Math.random() > 0.5 ? randomItem(['Weekly services', 'Monthly services', 'Major holidays only', 'Occasional', 'None']) : 'None',
    dietary_restrictions: Math.random() > 0.7 ? randomItem(['None', 'Vegetarian', 'Vegan', 'Kosher', 'Halal', 'Gluten-free']) : 'None',
    family_rules: randomItems(HOUSE_RULES, 3, 6),
    student_expectations: randomItems(STUDENT_EXPECTATIONS, 3, 6)
  };
  
  // Generate home details with more information
  const enhancedHomeDetails = {
    type: randomItem(['Single-family house', 'Townhouse', 'Apartment', 'Condo', 'Farm/ranch']),
    ownership: randomItem(['Own', 'Rent']),
    square_footage: faker.number.int({ min: 1000, max: 4000 }),
    year_built: faker.number.int({ min: 1950, max: 2020 }),
    bedrooms: faker.number.int({ min: 2, max: 5 }),
    bathrooms: faker.number.int({ min: 1, max: 4 }),
    student_accommodation: {
      type: randomItem(['Private bedroom', 'Shared bedroom with host sibling', 'Private bedroom with shared bathroom', 'Suite with private bathroom']),
      floor: randomItem(['First floor', 'Second floor', 'Basement', 'Converted space']),
      furnishings: randomItems(['Bed', 'Desk', 'Dresser', 'Closet', 'Bookshelf', 'Chair', 'Lamp'], 4, 7)
    },
    amenities: randomItems(HOME_AMENITIES, 3, 8),
    has_wifi: true,
    internet_speed: randomItem(['High-speed', 'Standard', 'Basic']),
    yard_or_outdoor_space: Math.random() > 0.3,
    pool_or_hot_tub: Math.random() > 0.8,
    accessibility_features: Math.random() > 0.9 ? randomItems(['Wheelchair ramp', 'First floor bedroom', 'Grab bars', 'Wide doorways'], 1, 2) : []
  };
  
  // Generate references
  const references = Array.from({ length: faker.number.int({ min: 2, max: 4 }) }, () => ({
    name: faker.person.fullName(),
    relationship: randomItem(['Friend', 'Neighbor', 'Colleague', 'Family friend', 'Teacher', 'Religious leader', 'Former exchange student']),
    years_known: faker.number.int({ min: 2, max: 20 }),
    phone: faker.phone.number(),
    email: faker.internet.email()
  }));
  
  // Generate family activities and traditions
  const familyActivitiesAndTraditions = {
    regular_activities: randomItems(FAMILY_ACTIVITIES, 3, 6),
    annual_traditions: randomItems([
      'Summer vacation to the beach',
      'Holiday gatherings with extended family',
      'Thanksgiving dinner with neighbors',
      'Birthday celebrations with special meals',
      'Fourth of July barbecue',
      'New Year\'s Eve party',
      'Family reunion',
      'Spring break trip',
      'Fall festival participation',
      'Cultural heritage celebrations'
    ], 2, 4),
    typical_weekday: faker.lorem.paragraph(1),
    typical_weekend: faker.lorem.paragraph(1)
  };
  
  // Generate background check and verification information
  const verification = {
    background_check_date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
    background_check_status: randomItem(['Passed', 'In process', 'Pending']),
    home_visit_date: faker.date.past({ months: 9 }).toISOString().split('T')[0],
    home_visit_notes: faker.lorem.paragraph(1),
    reference_check_complete: Math.random() > 0.2,
    reference_check_date: faker.date.past({ months: 10 }).toISOString().split('T')[0],
    approved_date: faker.date.past({ months: 8 }).toISOString().split('T')[0],
    documents_submitted: {
      application_form: true,
      background_check_authorization: true,
      home_photos: true,
      id_verification: true,
      reference_letters: Math.random() > 0.3
    }
  };
  
  // Generate family bio
  const familyBio = randomItem(HOST_FAMILY_BIOS);
  
  // Generate hosting history
  const hasHostedBefore = Math.random() > 0.7;
  const hostingHistory = hasHostedBefore ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
    year: 2010 + faker.number.int({ min: 1, max: 12 }),
    student_name: faker.person.fullName(),
    student_country: randomItem(COUNTRIES).name,
    duration: randomItem(['Semester', 'Academic year', 'Summer']),
    organization: faker.company.name() + ' ' + randomItem(['Exchange', 'International', 'Students']),
    experience_summary: randomItem([
      'Very positive experience, still keep in touch',
      'Good experience with some adjustment challenges',
      'Positive experience overall',
      'Challenging but rewarding experience',
      'Great cultural exchange for the family'
    ])
  })) : [];
  
  profiles.push({
    id: profileId,
    user_id: id,
    type: 'host_family',
    data: {
      // Basic information
      family_name: lastName,
      address: faker.location.streetAddress() + ', ' + city + ', ' + state,
      phone_home: faker.phone.number(),
      phone_cell: faker.phone.number(),
      email_primary: email,
      email_secondary: Math.random() > 0.5 ? faker.internet.email() : null,
      
      // Primary and secondary host parents
      primary_host: {
        first_name: firstName,
        last_name: lastName,
        dob: faker.date.birthdate({ min: 30, max: 65, mode: 'age' }).toISOString().split('T')[0],
        occupation: faker.person.jobTitle(),
        employer: faker.company.name(),
        work_phone: faker.phone.number(),
        education: randomItem(['High School', 'Some College', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate']),
        languages: ['English'].concat(Math.random() > 0.7 ? [randomItem(COUNTRIES).language] : [])
      },
      secondary_host: Math.random() > 0.2 ? {
        first_name: faker.person.firstName(),
        last_name: lastName,
        dob: faker.date.birthdate({ min: 30, max: 65, mode: 'age' }).toISOString().split('T')[0],
        occupation: faker.person.jobTitle(),
        employer: faker.company.name(),
        work_phone: faker.phone.number(),
        education: randomItem(['High School', 'Some College', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate']),
        languages: ['English'].concat(Math.random() > 0.7 ? [randomItem(COUNTRIES).language] : [])
      } : null,
      
      // Family details
      family_members: enhancedFamilyMembers,
      
      // Home details
      home_details: enhancedHomeDetails,
      
      // Hosting preferences and application info
      hosting: hostingInfo,
      
      // Household information
      household: householdInfo,
      
      // Neighborhood and community
      neighborhood,
      
      // Activities and lifestyle
      family_activities: familyActivitiesAndTraditions,
      
      // References
      references,
      
      // Verification and background check
      verification,
      
      // Hosting history
      has_hosted_before: hasHostedBefore,
      hosting_history: hostingHistory,
      
      // Biographical information
      family_bio: familyBio,
      family_photos: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.image.url()),
      
      // Existing data we're keeping for compatibility
      diet_restrictions: householdInfo.dietary_restrictions,
      languages: householdInfo.primary_language === 'English' ? ['English'].concat(householdInfo.other_languages) : householdInfo.other_languages.concat(['English']),
      hobbies: randomItems(['sports', 'music', 'art', 'cooking', 'outdoors', 'travel', 'reading'], 1, 4),
      ...pets,
      state,
      city,
      school_district: city + ' School District',
      nearest_school: city + ' ' + randomItem(['High School', 'Academy', 'Secondary School'])
    },
    status: randomItem(STATUSES),
    verified: Math.random() > 0.2,
    created_at: faker.date.past({ years: 2 }),
    updated_at: faker.date.recent()
  });
  
  // Connect with a coordinator
  const coordinator = randomItem(coordinators);
  relationships.push({
    id: generateId(),
    type: 'coordinator_host',
    primary_id: coordinator.profileId,
    secondary_id: profileId,
    status: randomItem(RELATIONSHIP_STATUSES),
    start_date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
    end_date: Math.random() > 0.8 ? faker.date.future({ years: 1 }).toISOString().split('T')[0] : null,
    data: {
      notes: faker.lorem.sentence(),
      approval_date: faker.date.past({ years: 1 }).toISOString().split('T')[0]
    },
    created_at: faker.date.past({ years: 1 }),
    updated_at: faker.date.recent()
  });
  
  hostFamilies.push({ id, profileId, state, city });
  hostFamilyProfiles.push(profileId);
}

// 4. Generate Students
console.log('Generating students...');

// Choose status based on distribution
const chooseStudentStatus = () => {
  const rand = Math.random();
  let cumulativeProbability = 0;
  
  for (const [status, probability] of Object.entries(STUDENT_STATUS_DISTRIBUTION)) {
    cumulativeProbability += probability;
    if (rand < cumulativeProbability) {
      return status;
    }
  }
  
  return 'pending_review'; // fallback
};

// Generate a random date between two dates
const getDateBetween = (startDate, endDate) => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString().split('T')[0];
};

// Generate basic student information
const generateStudentBasicInfo = () => {
  const country = randomItem(COUNTRIES);
  const gender = randomItem(['Male', 'Female']);
  const firstName = gender === 'Male' ? faker.person.firstName('male') : faker.person.firstName('female');
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName, provider: 'example.com' });
  const dob = faker.date.birthdate({ min: 14, max: 18, mode: 'age' }).toISOString().split('T')[0];
  const program = randomItem(PROGRAMS);
  
  return { country, gender, firstName, lastName, email, dob, program };
};

// Generate student academic information
const generateStudentAcademics = () => {
  const gpa = randomItem(GPA_SCALES);
  const graduationYear = randomItem(GRADUATION_YEARS);
  const grade = randomItem(GRADES);
  const slep_score = faker.number.int({ min: ENGLISH_TEST_SCORES.SLEP.min, max: ENGLISH_TEST_SCORES.SLEP.max });
  const eltis_score = faker.number.int({ min: ENGLISH_TEST_SCORES.ELTIS.min, max: ENGLISH_TEST_SCORES.ELTIS.max });
  const private_school_tuition = Math.random() > 0.8;
  
  // Academic history
  const academic_history = {
    current_school: faker.company.name() + ' School',
    years_of_english: faker.number.int({ min: 1, max: 10 }),
    favorite_subjects: randomItems(['Mathematics', 'Science', 'History', 'Languages', 'Arts', 'Physical Education', 'Computer Science'], 2, 4),
    extracurricular_activities: randomItems(['Sports', 'Music', 'Art', 'Drama', 'Debate', 'Volunteering', 'Student Government'], 1, 3)
  };
  
  return {
    gpa,
    graduationYear,
    grade,
    slep_score,
    eltis_score,
    private_school_tuition,
    academic_history
  };
};

// Generate student health information
const generateStudentHealth = () => {
  const allergies = Math.random() > 0.8 ? {
    has_allergies: true,
    allergies: randomItems(['peanuts', 'dairy', 'gluten', 'shellfish', 'pollen', 'cats', 'dogs'], 1, 2)
  } : { has_allergies: false };
  
  const medical = Math.random() > 0.9 ? {
    has_medical_conditions: true,
    medical_conditions: randomItems(['asthma', 'diabetes', 'adhd', 'minor_allergies'], 1, 2)
  } : { has_medical_conditions: false };
  
  const dietary_restrictions = allergies.has_allergies ? 
    randomItem(['vegetarian', 'vegan', 'gluten_free', 'none']) : 'none';
  
  const enhanced_health_info = {
    ...allergies,
    ...medical,
    dietary_restrictions,
    can_adjust_to_smoker: Math.random() > 0.7,
    afraid_of_pets: Math.random() > 0.9,
    allergic_to_animals: allergies.has_allergies && Math.random() > 0.6,
    allergic_to_dust: Math.random() > 0.8,
    allergic_to_food: allergies.has_allergies && Math.random() > 0.7,
    medications: medical.has_medical_conditions ? faker.lorem.words(3) : 'None',
    vaccinations_complete: Math.random() > 0.1
  };
  
  return { enhanced_health_info, dietary_restrictions };
};

// Generate SEVIS data based on status
const generateSevisData = (studentStatus) => {
  let sevisData = {};
  
  if (['pending_sevis', 'submitted_to_sevis', 'sevis_approved', 'sevis_rejected'].includes(studentStatus)) {
    // Basic SEVIS data for all SEVIS-related statuses
    sevisData = {
      sevis_submitted_date: faker.date.past({ months: 3 }).toISOString().split('T')[0]
    };
    
    if (['sevis_approved', 'sevis_rejected'].includes(studentStatus)) {
      // Add response date for completed SEVIS processes
      sevisData.sevis_response_date = faker.date.past({ weeks: 6 }).toISOString().split('T')[0];
    }
    
    // Only SEVIS Approved students get SEVIS ID and DS2019
    if (studentStatus === 'sevis_approved') {
      sevisData.sevis_id = 'N' + faker.number.int({ min: 1000000, max: 9999999 });
      sevisData.ds2019_issued = true;
      sevisData.ds2019_issue_date = faker.date.past({ weeks: 4 }).toISOString().split('T')[0];
    }
  }
  
  return sevisData;
};

// Generate each student
for (let i = 0; i < NUM_STUDENTS; i++) {
  const id = generateId();
  const profileId = generateId();
  const studentStatus = chooseStudentStatus();
  
  // Generate basic student information
  const { country, gender, firstName, lastName, email, dob, program } = generateStudentBasicInfo();
  
  const createdAt = faker.date.past({ years: 1 });
  const updatedAt = faker.date.recent({ refDate: createdAt });
  
  users.push({
    id,
    email,
    role: 'student',
    first_name: firstName,
    last_name: lastName,
    phone: faker.phone.number(),
    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName+'+'+lastName)}`,
    status: 'active',
    metadata: { 
      country_of_origin: country.name,
      gender,
      student_status: studentStatus
    },
    created_at: createdAt,
    updated_at: updatedAt
  });
  
  // Generate student health information
  const { enhanced_health_info, dietary_restrictions } = generateStudentHealth();
  
  // Generate academic information
  const academics = generateStudentAcademics();
  
  // Generate placement preferences
  const placement_preferences = {
    pet_preference: randomItem(PET_PREFERENCES),
    location_preference: randomItem(LOCATION_PREFERENCES),
    family_preference: randomItem(FAMILY_PREFERENCES),
    special_requests: Math.random() > 0.7 ? randomItem(SPECIAL_REQUESTS) : []
  };
  
  // Generate passport information
  const passport = {
    number: faker.string.alphanumeric({ length: { min: 8, max: 9 }, casing: 'upper' }),
    issue_date: faker.date.past({ years: 3 }).toISOString().split('T')[0],
    expiry_date: faker.date.future({ years: 5 }).toISOString().split('T')[0],
    issuing_country: country.name
  };
  
  // Generate program dates
  const arrival_date = faker.date.future({ years: 1, refDate: new Date('2023-07-01') }).toISOString().split('T')[0];
  const departure_date = faker.date.future({ years: 2, refDate: new Date(arrival_date) }).toISOString().split('T')[0];
  
  // Generate parent/guardian information
  const parents = [
    {
      relation: 'mother',
      name: faker.person.fullName({ sex: 'female' }),
      occupation: faker.person.jobTitle(),
      phone: faker.phone.number(),
      email: faker.internet.email()
    }
  ];
  
  // Add father for some students
  if (Math.random() > 0.2) {
    parents.push({
      relation: 'father',
      name: faker.person.fullName({ sex: 'male' }),
      occupation: faker.person.jobTitle(),
      phone: faker.phone.number(),
      email: faker.internet.email()
    });
  }
  
  // Home address in country of origin
  const home_address = {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state_province: faker.location.state(),
    postal_code: faker.location.zipCode(),
    country: country.name
  };
  
  // Generate favorite activities - always 3 different ones
  const favoriteActivitiesIndices = randomItems([...Array(ALL_FAVORITE_ACTIVITIES.length).keys()], 3, 3).map(index => ALL_FAVORITE_ACTIVITIES[index]);
  
  const student_bio = randomItem(ALL_STUDENT_BIOS);
  
  // Generate SEVIS data based on status
  const sevisData = generateSevisData(studentStatus);
  
  // Add reviewer and acceptance date if student is not pending review
  const acceptedData = {};
  if (studentStatus !== 'pending_review') {
    acceptedData.accepted_on = getDateBetween(createdAt, updatedAt);
    acceptedData.reviewed_by = randomItem(REVIEWERS);
  }
  
  profiles.push({
    id: profileId,
    user_id: id,
    type: 'student',
    data: {
      date_of_birth: dob,
      gender,
      country_of_origin: country.name,
      native_language: country.language,
      english_proficiency: randomItem(['beginner', 'intermediate', 'advanced', 'fluent']),
      school_grade: academics.grade,
      program: {
        type: program.id,
        duration: program.duration,
        year: faker.date.recent().getFullYear()
      },
      academic: {
        gpa: academics.gpa,
        graduation_year: academics.graduationYear,
        private_school_tuition: academics.private_school_tuition,
        slep_score: academics.slep_score,
        eltis_score: academics.eltis_score,
        history: academics.academic_history
      },
      emergency_contact: {
        name: faker.person.fullName(),
        relationship: randomItem(['father', 'mother', 'guardian']),
        phone: faker.phone.number(),
        email: faker.internet.email()
      },
      parents,
      home_address,
      placement_preferences,
      program_dates: {
        arrival_date,
        departure_date
      },
      passport,
      application: {
        status: studentStatus,
        date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
        notes: faker.lorem.sentence()
      },
      sevis: sevisData,
      hobbies: randomItems(['sports', 'music', 'art', 'cooking', 'reading', 'travel'], 1, 4),
      favorite_activities: favoriteActivitiesIndices,
      student_bio,
      personal_statement: faker.lorem.paragraph(),
      health: enhanced_health_info,
      diet_restrictions: dietary_restrictions,
      religion: Math.random() > 0.5 ? randomItem(['christian', 'catholic', 'jewish', 'muslim', 'buddhist', 'hindu', 'none']) : 'none',
      details: faker.lorem.paragraph(),
      academic_interests: randomItems(['math', 'science', 'history', 'languages', 'arts', 'technology'], 1, 3),
      host_family_status: 'Unassigned',
      school_status: 'Unassigned',
      ...acceptedData
    },
    status: 'active',
    verified: Math.random() > 0.3,
    created_at: createdAt,
    updated_at: updatedAt
  });
  
  // Connect with a sending org
  createStudentSendingOrgRelationship(profileId, program, studentStatus, sevisData);
  
  // Only connect SEVIS Approved students with host families and schools
  if (studentStatus === 'sevis_approved' && Math.random() < 0.7 && hostFamilyProfiles.length > 0) {
    createStudentHostFamilyRelationship(profileId, program);
  }
}

// Function to create relationship between student and sending org
function createStudentSendingOrgRelationship(profileId, program, studentStatus, sevisData) {
  const sendingOrg = randomItem(sendingOrgs);
  
  relationships.push({
    id: generateId(),
    type: 'sending_org_student',
    primary_id: sendingOrg.profileId,
    secondary_id: profileId,
    status: 'active',
    start_date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
    end_date: null,
    data: {
      program_type: program.id,
      partner_organization: sendingOrg.name,
      application_date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
      approval_date: studentStatus !== 'pending_review' ? faker.date.past({ months: 6 }).toISOString().split('T')[0] : null,
      visa_status: studentStatus === 'sevis_approved' ? 'issued' : 
                   studentStatus === 'sevis_rejected' ? 'rejected' : 
                   (studentStatus === 'submitted_to_sevis' || studentStatus === 'pending_sevis') ? 'pending' : 'not_started',
      ...sevisData
    },
    created_at: faker.date.past({ years: 1 }),
    updated_at: faker.date.recent()
  });
}
  
// Function to create relationship between student and host family
function createStudentHostFamilyRelationship(profileId, program) {
    const hostFamily = randomItem(hostFamilies);
    
    relationships.push({
      id: generateId(),
      type: 'host_student',
      primary_id: hostFamily.profileId,
      secondary_id: profileId,
    status: 'active',
      start_date: faker.date.past({ months: 6 }).toISOString().split('T')[0],
    end_date: null,
      data: {
        program_type: program.id,
        school_name: hostFamily.city + ' ' + randomItem(['High School', 'Academy', 'Secondary School']),
        placement_date: faker.date.past({ months: 6 }).toISOString().split('T')[0],
        coordinator_notes: faker.lorem.sentences(2)
      },
      created_at: faker.date.past({ months: 6 }),
      updated_at: faker.date.recent()
    });
  
  // Update host family and school status
  const profileIndex = profiles.findIndex(p => p.id === profileId);
  if (profileIndex !== -1) {
    profiles[profileIndex].data.host_family_status = hostFamily.lastName + ' Family';
    
    // Assign school for subset of students with host families
    if (Math.random() < 0.8) {
      profiles[profileIndex].data.school_status = hostFamily.city + ' ' + randomItem(['High School', 'Academy', 'Secondary School']);
    }
  }
}

// Prepare data for export
const data = {
  users,
  profiles,
  relationships
};

// Export to JSON file
const outputFile = path.join(__dirname, 'mock-data.json');
fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));

console.log(`✅ Generated mock data and saved to ${outputFile}`);
console.log(`- ${users.length} users`);
console.log(`- ${profiles.length} profiles`);
console.log(`- ${relationships.length} relationships`);

// Generate SQL file
const generateSqlInsert = (table, records) => {
  if (!records.length) return '';
  
  return records.map(record => {
    const columns = Object.keys(record).join(', ');
    const vals = Object.values(record).map(val => {
      if (val === null) return 'NULL';
      if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
      if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
      return val;
    });
    
    return `INSERT INTO ${table} (${columns}) VALUES (${vals.join(', ')});`;
  }).join('\n');
};

const sql = `
-- Generated mock data for student exchange program

-- Clean up existing data
TRUNCATE users, profiles, relationships RESTART IDENTITY CASCADE;

${generateSqlInsert('users', users)}

${generateSqlInsert('profiles', profiles)}

${generateSqlInsert('relationships', relationships)}
`;

// Export to SQL file
const sqlOutputFile = path.join(__dirname, 'mock-data.sql');
fs.writeFileSync(sqlOutputFile, sql);

console.log(`✅ Generated SQL file saved to ${sqlOutputFile}`);
console.log('To import into Supabase:');
console.log('1. Log into your Supabase dashboard');
console.log('2. Go to the SQL Editor');
console.log('3. Copy and paste the contents of mock-data.sql');
console.log('4. Run the SQL to populate the tables with sample data'); 