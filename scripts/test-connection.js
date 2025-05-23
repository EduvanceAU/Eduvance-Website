const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test the connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');

    // Try to query the database
    const count = await prisma.pastPaper.count();
    console.log(`📊 Total papers in database: ${count}`);

    // Try to fetch some sample data
    const sample = await prisma.pastPaper.findFirst();
    if (sample) {
      console.log('📄 Sample paper:', {
        year: sample.year,
        session: sample.session,
        unitCode: sample.unitCode,
        paperType: sample.paperType
      });
    }

  } catch (error) {
    console.error('❌ Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 