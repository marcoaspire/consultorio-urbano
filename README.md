# Consultorio Urbano — Monorepo

Arquitectura Monorepo desacoplada y lista para producción compuesta por un cliente SPA moderno (**React 19 + Vite + TypeScript**) y una API REST dedicada (**Node.js + Express + TypeScript + PostgreSQL + Cloudflare R2**).

---

## 📁 Estructura del Proyecto

```text
/
├── client/                     # Frontend SPA (React + Vite + TypeScript)
│   ├── src/
│   │   ├── features/           # Módulos por dominio (auth, gallery, projects, upload, etc.)
│   │   ├── services/           # Abstracción HTTP centralizada (api.ts) y servicios
│   │   ├── types/              # Interfaces TypeScript compartidas
│   │   └── ...
│   ├── public/                 # Assets públicos
│   ├── vercel.json             # Regla de reescritura para rutas SPA
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example            # Variables requeridas para el cliente
│
├── server/                     # Backend REST API Dedicado (Node.js + Express + TS)
│   ├── src/
│   │   ├── config/             # Configuración de entorno, PostgreSQL Pool y Cloudflare R2 S3 Client
│   │   ├── controllers/        # Controladores REST (auth, projects, analyses, categories, media)
│   │   ├── services/           # Capa de lógica de negocio y queries parametrizadas
│   │   ├── middlewares/        # Autenticación JWT nativa (requireAuth) y manejo de errores
│   │   ├── routes/             # Enrutamiento modular bajo /api
│   │   ├── db/                 # Schema DDL (schema.sql) y script de inicialización (init.ts)
│   │   └── index.ts            # Entrypoint de Express
│   ├── Dockerfile              # Dockerfile multi-stage optimizado para producción
│   ├── package.json
│   └── .env.example            # Variables requeridas para el servidor
│
└── README.md                   # Documentación y guía de despliegue
```

---

## 🚀 Puesta en Marcha Local

### 1. Requisitos Previos
* Node.js `>= 20.x` (probado en v22.x)
* PostgreSQL `>= 14` local o en la nube (ej. Neon, Supabase PostgreSQL, AWS RDS)
* (Opcional) Cuenta de Cloudflare con credenciales de API para **Cloudflare R2**

---

### 2. Configuración y Ejecución del Backend (`server/`)

1. Navega a la carpeta del servidor e instala dependencias:
   ```bash
   cd server
   npm install
   ```

2. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Edita `.env` con los datos de tu base de datos PostgreSQL, JWT secret y credenciales de Cloudflare R2:
   ```env
   PORT=4000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173

   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/consultorio_urbano

   JWT_SECRET=tu_clave_secreta_jwt_muy_segura
   JWT_EXPIRES_IN=1h
   REFRESH_TOKEN_EXPIRES_IN=7d

   R2_ACCOUNT_ID=tu_cloudflare_account_id
   R2_ACCESS_KEY=tu_r2_access_key_id
   R2_SECRET_KEY=tu_r2_secret_access_key
   R2_BUCKET_NAME=consultorio-urbano-assets
   R2_PUBLIC_URL=https://pub-tu-bucket.r2.dev
   ```

3. Inicializa las tablas y datos semilla en PostgreSQL:
   ```bash
   npm run db:init
   ```

4. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   La API estará disponible en `http://localhost:4000/api` (Healthcheck: `http://localhost:4000/api/health`).

---

### 3. Configuración y Ejecución del Frontend (`client/`)

1. En una nueva terminal, navega a la carpeta del cliente:
   ```bash
   cd client
   npm install
   ```

2. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Asegúrate de que apunta a la API backend:
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```

3. Inicia el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
   Accede a la aplicación en `http://localhost:5173`.

4. Validar compilación de producción:
   ```bash
   npm run build
   ```

---

## 📡 Arquitectura de Almacenamiento: Cloudflare R2 Direct-to-Storage

Para soportar archivos pesados (imágenes satelitales, PDFs técnicos y videos de hasta 250MB) sin saturar los recursos del servidor de aplicaciones, se implementó el patrón **Direct-to-Storage**:

```text
[ React Client ]  ---- (1) POST /api/media/presigned-url ---->  [ Express Server ]
        │                                                               │
        │ <---------- (2) Retorna Presigned PUT URL -------------------┘
        │
        ▼ (3) PUT binario directo con seguimiento de progreso (XHR)
[ Cloudflare R2 Bucket ]
        │
        ▼ (4) POST /api/analyses (con key/publicUrl del asset)
[ Express Server ] ---> Persiste metadata en PostgreSQL (analysis_assets)
```

1. **Solicitud de URL Presignada:** `POST /api/media/presigned-url` genera un enlace temporal con expiración de 15 minutos mediante `@aws-sdk/s3-request-presigner` y `@aws-sdk/client-s3`.
2. **Subida Directa:** El navegador ejecuta una petición HTTP `PUT` directamente contra Cloudflare R2. La barra de progreso de la interfaz se actualiza en tiempo real mediante `XMLHttpRequest.upload.onprogress`.
3. **Persistencia:** Al finalizar, el cliente confirma la subida o envía las referencias de los assets al crear o actualizar el análisis en `/api/analyses`.

---

## 🔐 Autenticación y Seguridad (JWT Nativo)

* **Tokens:**
  * `accessToken`: Duración de 1 hora, enviado en el encabezado `Authorization: Bearer <token>`.
  * `refreshToken`: Duración de 7 días, persistido en la tabla `refresh_tokens` de PostgreSQL con rotación automática tras cada refresco.
* **Manejo en Cliente:** `client/src/services/api.ts` intercepta respuestas `401 Unauthorized`, renueva el token contra `/api/auth/refresh` de forma transparente y reintenta las solicitudes pendientes.

---

## 🚢 Despliegue en Producción

### Frontend en Vercel
1. Conecta el repositorio de GitHub a tu proyecto en Vercel.
2. Ve a **Settings -> General**:
   * **Root Directory**: Configúralo en `client`.
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. En **Environment Variables**, añade:
   * `VITE_API_URL`: La URL pública de tu backend en producción (ej. `https://api.tudominio.com/api`).
4. `client/vercel.json` se encarga de redirigir todas las rutas a `/` para soportar navegación SPA mediante React Router.

### Backend con Docker
El backend incluye un `Dockerfile` multi-stage ligero basado en Alpine:

```bash
cd server
docker build -t consultorio-urbano-api .
docker run -p 4000:4000 --env-file .env consultorio-urbano-api
```
Compatible con Render, Railway, AWS ECS, Fly.io, DigitalOcean App Platform o Kubernetes.
