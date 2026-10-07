import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { env } from '../config/env.js';
import type { User, UserWithPassword, AuthTokens } from '../types/index.js';

export const authService = {
  generateTokens(user: User): AuthTokens {
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  },

  async register(data: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
      [data.email.toLowerCase().trim()]
    );

    if (existing.rows.length > 0) {
      throw new Error('Ya existe una cuenta registrada con este correo electrónico.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const result = await db.query(
      `INSERT INTO users (firstname, lastname, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, firstname, lastname, email, created_at, updated_at, deleted_at`,
      [
        data.firstname.trim(),
        data.lastname.trim(),
        data.email.toLowerCase().trim(),
        passwordHash,
      ]
    );

    const user: User = result.rows[0];
    const tokens = this.generateTokens(user);

    // Guardar refresh token en base de datos
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokens.refreshToken, expiresAt]
    );

    return { user, tokens };
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [data.email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      throw new Error('Credenciales inválidas. Correo o contraseña incorrectos.');
    }

    const row: UserWithPassword = result.rows[0];
    const passwordValid = await bcrypt.compare(data.password, row.password_hash);

    if (!passwordValid) {
      throw new Error('Credenciales inválidas. Correo o contraseña incorrectos.');
    }

    const user: User = {
      id: row.id,
      firstname: row.firstname,
      lastname: row.lastname,
      email: row.email,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    };

    const tokens = this.generateTokens(user);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokens.refreshToken, expiresAt]
    );

    return { user, tokens };
  },

  async refreshToken(oldRefreshToken: string): Promise<AuthTokens> {
    const tokenResult = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked_at IS NULL AND expires_at > NOW()',
      [oldRefreshToken]
    );

    if (tokenResult.rows.length === 0) {
      throw new Error('Refresh token inválido o expirado.');
    }

    const tokenRow = tokenResult.rows[0];

    try {
      jwt.verify(oldRefreshToken, env.JWT_SECRET);
    } catch {
      throw new Error('Firma de refresh token inválida.');
    }

    const userResult = await db.query(
      'SELECT id, firstname, lastname, email, created_at, updated_at, deleted_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [tokenRow.user_id]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Usuario asociado no encontrado o inactivo.');
    }

    const user: User = userResult.rows[0];
    const newTokens = this.generateTokens(user);

    // Revocar el token anterior (rotación de tokens)
    await db.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [
      tokenRow.id,
    ]);

    // Guardar nuevo refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, newTokens.refreshToken, expiresAt]
    );

    return newTokens;
  },

  async logout(refreshToken: string): Promise<void> {
    if (refreshToken) {
      await db.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = $1', [
        refreshToken,
      ]);
    }
  },

  async getProfile(userId: string): Promise<User | null> {
    const result = await db.query(
      'SELECT id, firstname, lastname, email, created_at, updated_at, deleted_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0];
  },
};
