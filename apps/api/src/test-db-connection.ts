import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  // Test with explicit configuration
  console.log('Testing connection with explicit config...');

  try {
    const sql = postgres({
      host: '127.0.0.1',
      port: 5432,
      user: 'winmarket',
      password: 'password',
      database: 'winmarket_v2',
      max: 1,
      connect_timeout: 5,
      ssl: false,
    });

    const result = await sql`SELECT version() as version, current_database() as database, current_user as user`;
    console.log('✅ Connection successful!');
    console.log('Database info:', result[0]);

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

testConnection();