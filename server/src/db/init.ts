import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase(): Promise<void> {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  try {
    console.log('📦 Inicializando esquema de base de datos PostgreSQL...');
    await db.query(sql);
    console.log('✅ Esquema y datos semilla creados/verificados correctamente.');
  } catch (error) {
    console.error('❌ Error al inicializar esquema de base de datos:', error);
    throw error;
  }
}

// Ejecución directa si se invoca por CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
