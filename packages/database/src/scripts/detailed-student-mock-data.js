/**
 * Detailed Student Mock Data Generator
 * Creates comprehensive student application data for SEVIS processing
 * Based on the structure shown in sevis-processing-student-view.tsx
 */

// Utility functions
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomItems = (array, min, max) => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
const formatDate = (date) => date.toISOString().split('T')[0];

// Countries with detailed cultural information (avoiding existing Germany, Spain, France, Italy, Japan)
const COUNTRIES = {
  'Norway': {
    language: 'Norwegian',
    cities: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen'],
    phone_code: '+47',
    postal_format: '####',
    currency: 'NOK'
  },
  'Netherlands': {
    language: 'Dutch',
    cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
    phone_code: '+31',
    postal_format: '#### ##',
    currency: 'EUR'
  },
  'Poland': {
    language: 'Polish',
    cities: ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan'],
    phone_code: '+48',
    postal_format: '##-###',
    currency: 'PLN'
  },
  'Denmark': {
    language: 'Danish',
    cities: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg'],
    phone_code: '+45',
    postal_format: '####',
    currency: 'DKK'
  },
  'Finland': {
    language: 'Finnish',
    cities: ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu'],
    phone_code: '+358',
    postal_format: '#####',
    currency: 'EUR'
  },
  'Austria': {
    language: 'German',
    cities: ['Vienna', 'Salzburg', 'Innsbruck', 'Graz', 'Linz'],
    phone_code: '+43',
    postal_format: '####',
    currency: 'EUR'
  },
  'Belgium': {
    language: 'Dutch',
    cities: ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liege'],
    phone_code: '+32',
    postal_format: '####',
    currency: 'EUR'
  },
  'Switzerland': {
    language: 'German',
    cities: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne'],
    phone_code: '+41',
    postal_format: '####',
    currency: 'CHF'
  },
  'Portugal': {
    language: 'Portuguese',
    cities: ['Lisbon', 'Porto', 'Braga', 'Coimbra', 'Aveiro'],
    phone_code: '+351',
    postal_format: '####-###',
    currency: 'EUR'
  },
  'Czech Republic': {
    language: 'Czech',
    cities: ['Prague', 'Brno', 'Ostrava', 'Plzen', 'Liberec'],
    phone_code: '+420',
    postal_format: '### ##',
    currency: 'CZK'
  }
};

// Names by country and gender
const NAMES = {
  'Norway': {
    male: ['Magnus', 'Oskar', 'Emil', 'Oliver', 'Filip', 'Jakob', 'Lucas', 'Isak', 'Mathias', 'Alexander'],
    female: ['Emma', 'Nora', 'Sara', 'Sofie', 'Linnea', 'Thea', 'Maya', 'Lea', 'Ingrid', 'Anna'],
    surnames: ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Kristiansen', 'Jensen', 'Karlsen']
  },
  'Netherlands': {
    male: ['Daan', 'Sem', 'Milan', 'Liam', 'Lucas', 'Finn', 'Noa', 'Max', 'Jesse', 'Bram'],
    female: ['Emma', 'Sophie', 'Julia', 'Zoe', 'Lisa', 'Eva', 'Anna', 'Sara', 'Isa', 'Fleur'],
    surnames: ['De Jong', 'Jansen', 'De Vries', 'Van Den Berg', 'Van Dijk', 'Bakker', 'Janssen', 'Visser', 'Smit', 'Meijer']
  },
  'Poland': {
    male: ['Aleksander', 'Filip', 'Jakub', 'Szymon', 'Antoni', 'Mikolaj', 'Franciszek', 'Jan', 'Tymon', 'Leon'],
    female: ['Zuzanna', 'Maja', 'Julia', 'Zofia', 'Lena', 'Hanna', 'Alicja', 'Maria', 'Amelia', 'Oliwia'],
    surnames: ['Nowak', 'Kowalski', 'Wisniewski', 'Wojcik', 'Kowalczyk', 'Kaminski', 'Lewandowski', 'Zielinski', 'Szymanski', 'Wozniak']
  },
  'Denmark': {
    male: ['William', 'Oliver', 'Noah', 'Emil', 'Victor', 'Magnus', 'Frederik', 'Mathias', 'Lucas', 'Alexander'],
    female: ['Emma', 'Alma', 'Freja', 'Anna', 'Clara', 'Laura', 'Sofie', 'Ida', 'Josefine', 'Ella'],
    surnames: ['Nielsen', 'Jensen', 'Hansen', 'Pedersen', 'Andersen', 'Christensen', 'Larsen', 'Sorensen', 'Rasmussen', 'Jorgensen']
  },
  'Finland': {
    male: ['Vaino', 'Oliver', 'Leo', 'Elias', 'Eino', 'Toivo', 'Onni', 'Leevi', 'Aleksi', 'Aatos'],
    female: ['Aino', 'Eevi', 'Emma', 'Sofia', 'Venla', 'Aada', 'Ellen', 'Isla', 'Lilja', 'Helmi'],
    surnames: ['Korhonen', 'Virtanen', 'Makinen', 'Nieminen', 'Makela', 'Hamalainen', 'Laine', 'Heikkinen', 'Koskinen', 'Jarvinen']
  },
  'Austria': {
    male: ['Maximilian', 'Alexander', 'Paul', 'Elias', 'Jakob', 'Felix', 'David', 'Emil', 'Noah', 'Moritz'],
    female: ['Anna', 'Emma', 'Marie', 'Lena', 'Sophie', 'Lea', 'Mia', 'Sarah', 'Laura', 'Hannah'],
    surnames: ['Gruber', 'Huber', 'Bauer', 'Wagner', 'Muller', 'Pichler', 'Steiner', 'Moser', 'Mayer', 'Hofer']
  },
  'Belgium': {
    male: ['Arthur', 'Louis', 'Noah', 'Jules', 'Adam', 'Gabriel', 'Lucas', 'Mohamed', 'Liam', 'Victor'],
    female: ['Emma', 'Olivia', 'Louise', 'Camille', 'Alice', 'Mila', 'Juliette', 'Chloe', 'Lea', 'Zoe'],
    surnames: ['Peeters', 'Janssens', 'Maes', 'Jacobs', 'Mertens', 'Willems', 'Claes', 'Goossens', 'Wouters', 'De Smet']
  },
  'Switzerland': {
    male: ['Noah', 'Liam', 'Matteo', 'Ben', 'Leon', 'Finn', 'Elias', 'Louis', 'Luis', 'Gabriel'],
    female: ['Mia', 'Emma', 'Sofia', 'Lina', 'Ella', 'Lia', 'Elena', 'Anna', 'Lea', 'Nora'],
    surnames: ['Muller', 'Meier', 'Schmid', 'Keller', 'Weber', 'Huber', 'Schneider', 'Meyer', 'Steiner', 'Fischer']
  },
  'Portugal': {
    male: ['Santiago', 'Francisco', 'Afonso', 'Duarte', 'Miguel', 'Tomas', 'Gabriel', 'Goncalo', 'Joao', 'Rafael'],
    female: ['Matilde', 'Leonor', 'Beatriz', 'Carolina', 'Mariana', 'Ines', 'Margarida', 'Maria', 'Ana', 'Sofia'],
    surnames: ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues', 'Martins', 'Jesus', 'Sousa']
  },
  'Czech Republic': {
    male: ['Jakub', 'Jan', 'Tomas', 'Adam', 'Matej', 'Daniel', 'David', 'Filip', 'Vojtech', 'Lukas'],
    female: ['Tereza', 'Anna', 'Adela', 'Karolina', 'Natalie', 'Anezka', 'Eliska', 'Viktorie', 'Barbora', 'Klara'],
    surnames: ['Novak', 'Svoboda', 'Novotny', 'Dvorak', 'Cerny', 'Prochazka', 'Kucera', 'Vesely', 'Horak', 'Nemec']
  }
};

// Activities and interests
const EXTRACURRICULAR_ACTIVITIES = ['Soccer', 'Basketball', 'Volleyball', 'Swimming', 'Tennis', 'Track and Field', 'Skiing', 'Ice Hockey', 'Handball', 'Cycling', 'Orchestra', 'Choir', 'Theater', 'Art Club', 'Photography Club', 'Creative Writing', 'Dance', 'Debate Team', 'Model UN', 'Science Club', 'Math Olympiad', 'Chess Club', 'Robotics', 'Programming Club', 'Student Council', 'Volunteering', 'Environmental Club', 'Peer Tutoring'];

const ACADEMIC_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Engineering', 'Environmental Science', 'History', 'Literature', 'Philosophy', 'Geography', 'Social Studies', 'Psychology', 'Fine Arts', 'Music', 'Drama', 'Languages'];

const HOBBIES = ['Reading', 'Gaming', 'Cooking', 'Baking', 'Hiking', 'Cycling', 'Photography', 'Drawing', 'Painting', 'Music Production', 'Guitar', 'Piano', 'Violin', 'Skateboarding', 'Rock Climbing', 'Knitting', 'Gardening', 'Coding', 'Blog Writing', 'Traveling', 'Language Learning'];

// Generate comprehensive student profile
const generateStudentProfile = (index) => {
  const countries = Object.keys(COUNTRIES);
  const country = countries[index % countries.length];
  const countryData = COUNTRIES[country];
  
  const gender = Math.random() > 0.5 ? 'Male' : 'Female';
  const genderKey = gender.toLowerCase();
  
  const firstName = getRandomItem(NAMES[country][genderKey]);
  const lastName = getRandomItem(NAMES[country].surnames);
  const age = 15 + (index % 3); // Ages 15-17
  const birthDate = new Date();
  birthDate.setFullYear(birthDate.getFullYear() - age);
  birthDate.setMonth(Math.floor(Math.random() * 12));
  birthDate.setDate(Math.floor(Math.random() * 28) + 1);
  
  const city = getRandomItem(countryData.cities);
  const phone = `${countryData.phone_code} ${Math.floor(Math.random() * 90000) + 10000} ${Math.floor(Math.random() * 90000) + 10000}`;
  
  // Academic information
  const grade = age <= 15 ? '10th' : age === 16 ? '11th' : '12th';
  const englishYears = 4 + Math.floor(Math.random() * 6); // 4-10 years
  const englishLevel = englishYears >= 8 ? 'Intermediate (B2)' : 
                       englishYears >= 6 ? 'Pre-Intermediate (B1)' : 'Elementary (A2)';
  
  // Activities and interests
  const favoriteSubjects = getRandomItems(ACADEMIC_SUBJECTS, 2, 4);
  const extracurriculars = getRandomItems(EXTRACURRICULAR_ACTIVITIES, 1, 3);
  const hobbies = getRandomItems(HOBBIES, 2, 4);
  
  // Generate detailed bio sections
  const generateStudentBio = () => {
    const bioElements = [
      `Hi! I'm ${firstName}, a ${age}-year-old student from ${city}, ${country}.`,
      `I'm passionate about ${favoriteSubjects.slice(0, 2).join(' and ').toLowerCase()} and love ${extracurriculars[0].toLowerCase()}.`,
      `In my free time, I enjoy ${hobbies.slice(0, 2).join(', ').toLowerCase()}, and spending time with friends and family.`,
      `I'm excited to experience American high school life and improve my English while sharing my ${countryData.language.toLowerCase()} culture with my host family.`,
      `I believe this exchange will help me grow personally and academically while building lifelong friendships.`
    ];
    return bioElements.join(' ');
  };
  
  const generateDearFamilyLetter = () => {
    const letterElements = [
      `Dear Host Family,`,
      ``,
      `I am so excited to meet you and become part of your family! My name is ${firstName}, and I come from ${city} in ${country}.`,
      ``,
      `I love ${extracurriculars[0].toLowerCase()} and ${hobbies[0].toLowerCase()}, and I'm always eager to try new activities and learn about different cultures.`,
      ``,
      `I promise to be respectful, helpful around the house, and to share the wonderful traditions from ${country} with you.`,
      ``,
      `I can't wait to experience American life and create amazing memories together!`,
      ``,
      `With warm regards,`,
      `${firstName}`
    ];
    return letterElements.join('\n');
  };
  
  // Return structured profile data
  return {
    // Basic Information
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    preferredName: firstName,
    gender,
    dateOfBirth: formatDate(birthDate),
    age,
    cityOfBirth: city,
    countryOfBirth: country,
    countryOfCitizenship: country,
    
    // Contact Information
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    cellPhone: phone,
    homePhone: `${countryData.phone_code} ${Math.floor(Math.random() * 90000) + 10000} ${Math.floor(Math.random() * 90000) + 10000}`,
    
    // Address
    address: {
      line1: `${Math.floor(Math.random() * 999) + 1} ${getRandomItem(['Main', 'Oak', 'Park', 'First', 'Second', 'Third'])} Street`,
      line2: Math.random() > 0.7 ? `Apartment ${Math.floor(Math.random() * 20) + 1}` : '',
      city,
      postalCode: countryData.postal_format.replace(/#/g, () => Math.floor(Math.random() * 10)),
      country
    },
    
    // Academic Information
    currentGrade: grade,
    currentSchool: `${city} ${getRandomItem(['High School', 'Secondary School', 'Gymnasium', 'Academy'])}`,
    schoolType: getRandomItem(['Public', 'Private']),
    graduationDate: `June ${2024 + (17 - age)}`,
    favoriteSubjects: favoriteSubjects,
    englishYears: `${englishYears} years`,
    englishProficiency: englishLevel,
    
    // Program Information
    programType: getRandomItem(['Academic Year', 'Semester (Fall)', 'Semester (Spring)']),
    preferredStates: getRandomItem([
      ['California', 'Texas', 'Florida'],
      ['New York', 'Pennsylvania', 'Massachusetts'],
      ['Colorado', 'Utah', 'Montana'],
      ['Washington', 'Oregon', 'Idaho']
    ]),
    
    // Family Information
    parents: {
      father: {
        firstName: getRandomItem(NAMES[country].male),
        lastName: lastName,
        occupation: getRandomItem(['Software Engineer', 'Teacher', 'Doctor', 'Engineer', 'Business Manager', 'Architect']),
        phone: `${countryData.phone_code} ${Math.floor(Math.random() * 90000) + 10000} ${Math.floor(Math.random() * 90000) + 10000}`,
        email: `${firstName.toLowerCase()}.father@email.com`,
        isLegalGuardian: true,
        status: 'Living'
      },
      mother: {
        firstName: getRandomItem(NAMES[country].female),
        lastName: lastName,
        occupation: getRandomItem(['Nurse', 'Teacher', 'Marketing Manager', 'Graphic Designer', 'Pharmacist', 'Psychologist']),
        phone: `${countryData.phone_code} ${Math.floor(Math.random() * 90000) + 10000} ${Math.floor(Math.random() * 90000) + 10000}`,
        email: `${firstName.toLowerCase()}.mother@email.com`,
        isLegalGuardian: true,
        status: 'Living'
      },
      relationshipStatus: getRandomItem(['Together', 'Married']),
      livingArrangement: getRandomItem(['In a House', 'In an Apartment'])
    },
    
    // Activities and Interests
    extracurriculars,
    hobbies,
    favoriteActivity1: {
      name: extracurriculars[0],
      description: `I have been involved in ${extracurriculars[0].toLowerCase()} for over ${Math.floor(Math.random() * 4) + 2} years. It has taught me ${getRandomItem(['teamwork', 'discipline', 'leadership', 'perseverance'])} and helped me develop ${getRandomItem(['confidence', 'skills', 'friendships', 'character'])}. I particularly enjoy ${getRandomItem(['the competitive aspect', 'working with others', 'the physical challenge', 'learning new techniques'])}.`
    },
    favoriteActivity2: {
      name: hobbies[0],
      description: `${hobbies[0]} has been a passion of mine since I was young. It allows me to ${getRandomItem(['express creativity', 'relax and unwind', 'learn new things', 'challenge myself'])} and has become an important part of who I am. Through this hobby, I've ${getRandomItem(['met interesting people', 'developed patience', 'learned valuable skills', 'gained confidence'])}.`
    },
    favoriteActivity3: {
      name: hobbies[1],
      description: `I discovered ${hobbies[1].toLowerCase()} recently and it has quickly become one of my favorite pastimes. It provides a great balance to my academic work and helps me ${getRandomItem(['stay active', 'be creative', 'connect with others', 'explore new interests'])}. I'm excited to continue pursuing this interest in America.`
    },
    
    // Assessment and Evaluation
    personalityRatings: {
      adaptability: 6 + Math.floor(Math.random() * 4), // 6-10
      maturity: 6 + Math.floor(Math.random() * 4),
      shyToOutgoing: 2 + Math.floor(Math.random() * 7), // 2-8
      outgoingFun: 5 + Math.floor(Math.random() * 5), // 5-10
      englishLevel: englishYears >= 8 ? 7 + Math.floor(Math.random() * 3) : 5 + Math.floor(Math.random() * 3),
      positiveAttitude: 7 + Math.floor(Math.random() * 3), // 7-10
      seriousToEasygoing: 3 + Math.floor(Math.random() * 5) // 3-7
    },
    
    // Interview details
    interview: {
      length: `${60 + Math.floor(Math.random() * 30)} minutes`,
      date: formatDate(getRandomDate(new Date(2024, 1, 1), new Date(2024, 4, 31))),
      interviewer: `${getRandomItem(['Sarah', 'Maria', 'Anna', 'Julia', 'Emma'])} ${getRandomItem(['Johnson', 'Anderson', 'Wilson', 'Davis', 'Miller'])}`,
      gpaAssessment: getRandomItem(['A-', 'B+', 'B', 'A'])
    },
    
    // Biography and letters
    studentBio: generateStudentBio(),
    dearFamilyLetter: generateDearFamilyLetter(),
    
    // Preferences and requirements
    dietaryRestrictions: Math.random() > 0.7 ? getRandomItem(['Vegetarian', 'Lactose intolerant', 'Nut allergy', 'Gluten-free']) : 'No restrictions',
    allergies: Math.random() > 0.8 ? getRandomItem(['Pollen (seasonal)', 'Pet dander', 'Dust mites', 'Food allergies']) : 'None',
    petPreference: getRandomItem(['Small pets', 'Medium pets', 'Large pets', 'All pets', 'No pets preferred']),
    
    // Languages
    nativeLanguage: countryData.language,
    additionalLanguages: [
      {
        language: 'English',
        years: englishYears,
        proficiency: englishLevel
      },
      {
        language: getRandomItem(['German', 'French', 'Spanish']),
        years: Math.floor(Math.random() * 4) + 2,
        proficiency: getRandomItem(['Basic (A1)', 'Elementary (A2)', 'Pre-Intermediate (B1)'])
      }
    ],
    
    // Awards
    awards: [
      {
        name: `${getRandomItem(['Academic Excellence', 'Honor Roll', 'Mathematics Competition', 'Science Fair'])} Award`,
        institution: `${city} ${getRandomItem(['High School', 'Secondary School', 'Academy'])}`,
        reason: getRandomItem(['Outstanding academic performance', 'Excellence in mathematics and sciences', 'Consistent high achievement']),
        date: `${Math.floor(Math.random() * 12) + 1}/${2022 + Math.floor(Math.random() * 2)}`
      },
      {
        name: `${getRandomItem(['Sports Championship', 'Athletic Achievement', 'Team Captain', 'Tournament Winner'])}`,
        institution: `${country} ${getRandomItem(['Youth Sports League', 'Regional Athletics', 'School Sports Federation'])}`,
        reason: getRandomItem(['Team leadership and performance', 'Regional championship victory', 'Outstanding sportsmanship']),
        date: `${Math.floor(Math.random() * 12) + 1}/${2023}`
      }
    ],
    
    // SEVIS Information
    sevisId: Math.random() > 0.7 ? `N${Math.floor(Math.random() * 9000000) + 1000000}` : 'Pending assignment',
    applicationStatus: getRandomItem(['Applied', 'Under Review', 'Approved', 'Documents Pending']),
    approvalDate: Math.random() > 0.5 ? formatDate(getRandomDate(new Date(2024, 2, 1), new Date(2024, 5, 30))) : 'Pending',
    approvedBy: getRandomItem(['Jennifer Smith', 'Michael Johnson', 'Sarah Wilson', 'David Brown', 'Emily Davis']),
    lastAction: getRandomItem(['Application submitted', 'Documents uploaded', 'Interview completed', 'Background check cleared'])
  };
};

// Generate multiple student profiles  
const generateMultipleStudents = (count = 20) => {
  const students = [];
  
  for (let i = 0; i < count; i++) {
    const student = generateStudentProfile(i);
    students.push(student);
  }
  
  return students;
};

// Export functions
export {
  generateStudentProfile,
  generateMultipleStudents,
  COUNTRIES
};

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Generating detailed student mock data...\n');
  
  const students = generateMultipleStudents(10);
  
  students.forEach((student, index) => {
    console.log(`\n=== Student ${index + 1}: ${student.fullName} ===`);
    console.log(`Country: ${student.countryOfBirth}`);
    console.log(`Age: ${student.age}, Grade: ${student.currentGrade}`);
    console.log(`Program: ${student.programType}`);
    console.log(`English Level: ${student.englishProficiency}`);
    console.log(`Main Activities: ${student.extracurriculars.slice(0, 2).join(', ')}`);
    console.log(`SEVIS Status: ${student.applicationStatus}`);
  });
  
  console.log(`\n\nGenerated ${students.length} detailed student profiles with comprehensive application data.`);
} 