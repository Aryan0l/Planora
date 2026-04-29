import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const normalizeConnectionString = (value?: string) => {
  if (!value) {
    return value;
  }

  const trimmedValue = value.trim().replace(/^['"]|['"]$/g, '');

  try {
    const url = new URL(trimmedValue);
    const sslMode = url.searchParams.get('sslmode');
    const hasCompatFlag = url.searchParams.has('uselibpqcompat');

    if (sslMode && !hasCompatFlag && ['prefer', 'require', 'verify-ca'].includes(sslMode)) {
      url.searchParams.set('uselibpqcompat', 'true');
      return url.toString();
    }
  } catch {
    return trimmedValue;
  }

  return trimmedValue;
};

const connectionString = normalizeConnectionString(
  process.env.DATABASE_URL || process.env.CONNECTION_URL,
);

const shouldUseSsl = () => {
  if (!connectionString) {
    return false;
  }

  try {
    const url = new URL(connectionString);
    const sslMode = url.searchParams.get('sslmode');

    if (sslMode === 'require' || url.hostname.includes('neon.tech')) {
      return true;
    }
  } catch {
    return process.env.DATABASE_SSL === 'true';
  }

  return process.env.DATABASE_SSL === 'true';
};

export const getDatabaseConnectionInfo = () => {
  if (!connectionString) {
    return {
      configured: false,
      host: null,
      ssl: false,
    };
  }

  try {
    const url = new URL(connectionString);
    return {
      configured: true,
      host: url.hostname,
      database: url.pathname.replace(/^\//, '') || null,
      ssl: shouldUseSsl(),
    };
  } catch {
    return {
      configured: true,
      host: 'invalid-url',
      database: null,
      ssl: shouldUseSsl(),
    };
  }
};

const pool = new Pool({
  connectionString,
  ssl: shouldUseSsl() ? { rejectUnauthorized: false } : false,
  max: 5,
  min: 0,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Warm up the pool on startup so first request isn't slow
pool.query('SELECT 1').catch(() => {});

export default pool;
