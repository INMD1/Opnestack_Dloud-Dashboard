import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// SQLite 클라이언트 생성
const client = createClient({
    url: process.env.DATABASE_URL || 'file:./sqlite.db',
});

// Drizzle ORM 인스턴스 생성
export const db = drizzle(client, { schema });
