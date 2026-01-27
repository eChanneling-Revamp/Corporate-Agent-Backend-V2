/**
 * Deploy Prisma Schema to New Centralized Database
 * This script deploys the schema to the new database before migration
 */

const { execSync } = require('child_process');

const NEW_DB_URL = 'postgresql://neondb_owner:npg_hS4GMgiPZA5F@ep-billowing-bush-a880wp07-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('🚀 Deploying Prisma schema to new centralized database...\n');

try {
  // Set the DATABASE_URL to the new database
  process.env.DATABASE_URL = NEW_DB_URL;
  
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n🔄 Deploying migrations to new database...');
  execSync(`npx prisma migrate deploy`, { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: NEW_DB_URL }
  });
  
  console.log('\n✅ Schema deployed successfully to centralized database!');
  console.log('✅ You can now run the migration script to copy data');
  
} catch (error) {
  console.error('❌ Schema deployment failed:', error.message);
  process.exit(1);
}
