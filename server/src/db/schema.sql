-- ==============================================================================
-- Schema SQL para Consultorio Urbano (PostgreSQL Estándar)
-- ==============================================================================

-- Extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- Índice para búsquedas rápidas por email y filtrado de soft-delete
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- 2. Tabla de Refresh Tokens (Sesiones JWT Activas)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- 3. Tabla de Categorías (Proyectos y Análisis)
CREATE TABLE IF NOT EXISTS categories (
    slug VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('project', 'analysis', 'both')),
    color VARCHAR(50) NULL,
    icon VARCHAR(50) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabla de Proyectos / Terrenos (Nivel 1)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    category_slug VARCHAR(50) NOT NULL REFERENCES categories(slug) ON UPDATE CASCADE,
    description TEXT NULL,
    thumbnail_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category_slug);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);

-- 5. Tabla de Análisis Geoespaciales (Nivel 2)
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    category_slug VARCHAR(50) NOT NULL REFERENCES categories(slug) ON UPDATE CASCADE,
    thumbnail_url TEXT NULL,
    video_url TEXT NULL,
    technical_summary JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_analyses_slug ON analyses(slug);
CREATE INDEX IF NOT EXISTS idx_analyses_project_id ON analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_analyses_category ON analyses(category_slug);
CREATE INDEX IF NOT EXISTS idx_analyses_deleted_at ON analyses(deleted_at);

-- 6. Tabla de Assets Asociados a Análisis
CREATE TABLE IF NOT EXISTS analysis_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NULL,
    metadata JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_analysis_assets_analysis_id ON analysis_assets(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_assets_deleted_at ON analysis_assets(deleted_at);

-- ==============================================================================
-- Datos Semilla (Seed Data)
-- ==============================================================================

INSERT INTO categories (slug, name, scope, color, icon) VALUES
    ('topografia', 'Topografía y Relieve', 'both', '#38bdf8', 'landscape'),
    ('catastro', 'Catastro y Delimitación', 'both', '#fbbf24', 'domain'),
    ('medio_ambiente', 'Impacto Ambiental', 'both', '#4ade80', 'eco'),
    ('movilidad', 'Movilidad Urbana', 'both', '#f472b6', 'directions_car')
ON CONFLICT (slug) DO NOTHING;
