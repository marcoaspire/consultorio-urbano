import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { pool } from './config/db.js';

const app = express();

// Middlewares globales
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
    credentials: true,
  })
);

// Habilitar subida de payloads binarios para el endpoint de devUpload si aplica
app.use('/api/media/dev-upload', express.raw({ type: '*/*', limit: '300mb' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas de la API
app.use('/api', apiRouter);

// Manejo de errores 404 y globales
app.use(notFoundHandler);
app.use(errorHandler);

// Inicio del servidor
const server = app.listen(env.PORT, () => {
  console.log(`🚀 Consultorio Urbano API corriendo en http://localhost:${env.PORT}`);
  console.log(`📡 Entorno: ${env.NODE_ENV}`);
  console.log(`📦 Health check: http://localhost:${env.PORT}/api/health`);
});

// Cierre ordenado (Graceful Shutdown)
const shutdown = async () => {
  console.log('🛑 Cerrando servidor y liberando recursos...');
  server.close(async () => {
    try {
      await pool.end();
      console.log('🔌 Conexiones de base de datos cerradas.');
      process.exit(0);
    } catch (err) {
      console.error('Error al cerrar conexiones:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
