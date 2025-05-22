const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const units = [
  { name: "Mechanics and Materials", code: "WPH11/01", unit: "Unit 1" },
  { name: "Waves and Electricity", code: "WPH12/01", unit: "Unit 2" },
  { name: "Practical Skills in Physics I", code: "WPH13/01", unit: "Unit 3" },
  { name: "Further Mechanics, Fields and Particles", code: "WPH14/01", unit: "Unit 4" },
  { name: "Thermodynamics, Radiation, Oscillations and Cosmology", code: "WPH15/01", unit: "Unit 5" },
  { name: "Practical Skills in Physics II", code: "WPH16/01", unit: "Unit 6" },
];

const sessions = ["January", "June", "November"];
const years = Array.from({ length: 10 }, (_, i) => 2015 + i);

// Base Google Drive folder URL
const BASE_DRIVE_URL = "https://drive.google.com/drive/folders/1d5lhDZWaWH1tsLz0v98fkgiSlrYKLgGz";

function getSessionFolder(year, session) {
  // Handle special cases for recent years
  if (year >= 2024) {
    if (session === "June") return "May June";
    if (session === "November") return "Oct Nov";
  }
  
  // Handle early years (2009-2015)
  if (year <= 2015) {
    return session.toLowerCase();
  }
  
  // Handle middle years (2016-2023)
  if (year >= 2016 && year <= 2023) {
    return session === "January" ? "Jan" :
           session === "June" ? "June" : "Oct";
  }
  
  // Default case
  return session === "January" ? "Jan" :
         session === "June" ? "June" : "Nov";
}

function generateDriveUrl(year, session, paperType, unitCode) {
  // Get the correct session folder name
  const sessionFolder = getSessionFolder(year, session);
  
  // Convert paper type to folder name format
  const paperTypeFolder = paperType === 'QP' ? "Question-paper" : "Marking-scheme";
  
  // Convert unit code to match file naming pattern (WPH11/01 -> wph11-01)
  const unitCodeFormatted = unitCode.toLowerCase().replace('/', '-');
  
  // Get month number for the date
  const monthNumber = session === "January" ? "01" : 
                     session === "June" ? "06" : "11";
  
  // Construct the filename
  const fileName = `${unitCodeFormatted}-${paperType === 'QP' ? 'que' : 'ms'}-${year}${monthNumber}12.pdf`;
  
  // Construct the full path
  return `${BASE_DRIVE_URL}/${year} ${sessionFolder}/${paperTypeFolder}/${fileName}`;
}

async function main() {
  console.log('Starting database seeding...');

  try {
    // Test connection
    await prisma.$connect();
    console.log('Successfully connected to the database');

    // Clear existing data
    await prisma.pastPaper.deleteMany({});
    console.log('Cleared existing data');

    // Create papers
    for (const year of years) {
      for (const session of sessions) {
        for (const unit of units) {
          // Create Question Paper
          await prisma.pastPaper.create({
            data: {
              year,
              session,
              unitCode: unit.code,
              unitName: unit.name,
              unitNumber: unit.unit,
              paperType: 'QP',
              paperUrl: generateDriveUrl(year, session, 'QP', unit.code),
            },
          });

          // Create Marking Scheme
          await prisma.pastPaper.create({
            data: {
              year,
              session,
              unitCode: unit.code,
              unitName: unit.name,
              unitNumber: unit.unit,
              paperType: 'MS',
              paperUrl: generateDriveUrl(year, session, 'MS', unit.code),
            },
          });
        }
      }
    }

    console.log('Successfully seeded the database');
    
    // Verify the data
    const count = await prisma.pastPaper.count();
    console.log(`Total papers in database: ${count}`);

    // Print some sample URLs to verify the structure
    const samples = await prisma.pastPaper.findMany({
      take: 3,
      orderBy: { year: 'desc' }
    });
    
    console.log('\nSample URLs:');
    samples.forEach(paper => {
      console.log(`${paper.year} ${paper.session} ${paper.unitCode} (${paper.paperType}): ${paper.paperUrl}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 