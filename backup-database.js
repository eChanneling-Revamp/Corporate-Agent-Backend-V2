const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Use the Neon database URL
const connectionString = 'postgresql://neondb_owner:npg_hS4GMgiPZA5F@ep-billowing-bush-a880wp07-pooler.eastus2.azure.neon.tech/neondb?sslmode=require';

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});


async function backupDatabase() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                      new Date().toTimeString().split(' ')[0].replace(/:/g, '');
    
    const backupData = {
      timestamp: new Date().toISOString(),
      tables: {}
    };

    // Get all table names
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log(`\nFound ${tablesResult.rows.length} tables to backup:`);
    
    // Backup each table
    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      console.log(`Backing up ${tableName}...`);
      
      const result = await client.query(`SELECT * FROM "${tableName}"`);
      backupData.tables[tableName] = result.rows;
      console.log(`  ✓ ${result.rows.length} records backed up`);
    }

    // Create backups directory if it doesn't exist
    const backupsDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Save backup to file
    const backupPath = path.join(backupsDir, `neondb_backup_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

    console.log('\n=================================');
    console.log('✓ Backup completed successfully!');
    console.log('=================================');
    console.log(`Backup saved to: ${backupPath}`);
    console.log(`\nBackup Statistics:`);
    
    let totalRecords = 0;
    Object.entries(backupData.tables).forEach(([table, data]) => {
      console.log(`  - ${table}: ${data.length} records`);
      totalRecords += data.length;
    });
    console.log(`\nTotal records backed up: ${totalRecords}`);
    
  } catch (error) {
    console.error('Error backing up database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

backupDatabase()
  .catch((error) => {
    console.error('Backup failed:', error);
    process.exit(1);
  });
