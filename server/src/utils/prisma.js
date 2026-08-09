require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

let prisma;

// If Turso / libSQL environment variables are provided (Production on Vercel)
if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  const { PrismaLibSQL } = require('@prisma/adapter-libsql');

  const adapter = new PrismaLibSQL({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
} else {
  // Local development SQLite fallback (file:./dev.db)
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

module.exports = prisma;
