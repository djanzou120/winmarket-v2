import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function testPgConnection() {
  console.log('Testing connection with pg library...');

  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'winmarket',
    password: 'password',
    database: 'winmarket_v2',
  });

  try {
    await client.connect();
    console.log('✅ Connection successful with pg!');

    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log('Database info:', result.rows[0]);

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed with pg:', error);
    process.exit(1);
  }
}

testPgConnection();