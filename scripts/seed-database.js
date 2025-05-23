const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const units = [
  { name: "Mechanics and Materials", code: "WPH11/01", unit: "Unit 1" },
  { name: "Waves and Electricity", code: "WPH12/01", unit: "Unit 2" },
  { name: "Practical Skills in Physics I", code: "WPH13/01", unit: "Unit 3" },
  { name: "Further Mechanics, Fields and Particles", code: "WPH14/01", unit: "Unit 4" },
  { name: "Thermodynamics, Radiation, Oscillations and Cosmology", code: "WPH15/01", unit: "Unit 5" },
  { name: "Practical Skills in Physics II", code: "WPH16/01", unit: "Unit 6" },
];

function parseFileContent(content, year, session) {
  const papers = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    if (!line.includes('Question paper') && !line.includes('Mark scheme')) continue;
    
    const [title, url] = line.split(': ');
    const isQuestionPaper = title.includes('Question paper');
    const unitMatch = title.match(/Unit (\d+) \(WPH(\d+)\)/);
    
    if (!unitMatch) continue;
    
    const unitNumber = unitMatch[1];
    const unitCode = `WPH${unitMatch[2]}/01`;
    const unit = units.find(u => u.code === unitCode);
    
    if (!unit) continue;
    
    papers.push({
      year,
      session,
      unitCode: unit.code,
      unitName: unit.name,
      unitNumber: unit.unit,
      paperType: isQuestionPaper ? 'QP' : 'MS',
      paperUrl: url.trim()
    });
  }
  
  return papers;
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

    // Read all files from the Physics (2018) directory
    const physicsDir = path.join(__dirname, 'Physics (2018)');
    const files = fs.readdirSync(physicsDir);

    let totalProcessed = 0;
    let totalSkipped = 0;

    for (const file of files) {
      if (!file.endsWith('.txt')) continue;

      // Parse year and session from filename
      const match = file.match(/([A-Za-z]+)-(\d{4})\.txt/);
      if (!match) continue;

      const [_, session, year] = match;
      const filePath = path.join(physicsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const papers = parseFileContent(content, parseInt(year), session);
      
      // Create papers in database
      for (const paper of papers) {
        try {
          await prisma.pastPaper.upsert({
            where: {
              year_session_unitCode_paperType: {
                year: paper.year,
                session: paper.session,
                unitCode: paper.unitCode,
                paperType: paper.paperType
              }
            },
            update: {
              paperUrl: paper.paperUrl
            },
            create: paper
          });
          totalProcessed++;
        } catch (error) {
          if (error.code === 'P2002') {
            totalSkipped++;
            continue;
          }
          throw error;
        }
      }
      
      console.log(`Processed ${file}: ${papers.length} papers`);
    }

    console.log('\nSeeding Summary:');
    console.log(`Total papers processed: ${totalProcessed}`);
    console.log(`Total papers skipped: ${totalSkipped}`);
    
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
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 