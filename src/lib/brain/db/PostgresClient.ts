
/**
 * @fileOverview Axiom Frontier - PostgreSQL Relational Core
 * Handles secure connection to the AWS RDS instance via environment variables.
 */

import { Pool } from 'pg';
import fs from 'fs';

export class PostgresClient {
  private pool: Pool | null = null;

  constructor() {
    // Ensure this only runs server-side
    if (typeof window === 'undefined') {
      const host = process.env.PGHOST || 'database-1.cjyis4meesmc.us-west-2.rds.amazonaws.com';
      const user = process.env.PGUSER || 'postgres';
      const password = process.env.PGPASSWORD || '2N00py123-';
      const database = process.env.PGDATABASE || 'postgres';
      const port = parseInt(process.env.PGPORT || '5432');
      
      if (!host || !user || !password) {
        console.warn('[POSTGRES_CORE] Environment variables missing. Ledger standby.');
        return;
      }

      this.pool = new Pool({
        host,
        port,
        database,
        user,
        password,
        ssl: { 
          rejectUnauthorized: false, 
          // Load SSL certificate if present
          ca: fs.existsSync('/certs/global-bundle.pem') 
            ? fs.readFileSync('/certs/global-bundle.pem').toString() 
            : undefined
        }
      });
    }
  }

  async query(text: string, params?: any[]) {
    if (!this.pool) throw new Error('PostgresClient not initialized or running client-side.');
    return this.pool.query(text, params);
  }

  async checkConnection(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const res = await this.pool.query('SELECT NOW()');
      return !!res.rows[0];
    } catch (e) {
      console.error('[POSTGRES_CONNECT_ERROR]', e);
      return false;
    }
  }

  async getVersion(): Promise<string | null> {
    if (!this.pool) return null;
    try {
      const res = await this.pool.query('SELECT version()');
      return res.rows[0].version;
    } catch (e) {
      console.error('[POSTGRES_VERSION_ERROR]', e);
      return null;
    }
  }
}

export const pgClient = new PostgresClient();
