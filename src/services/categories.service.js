import { id } from 'zod/locales';
import pool from '../config/db.js';

export const getAllCategories = async () => {
    const result = await pool.query(
        'SELECT * FROM categories ORDER BY name ASC'
    );
    return result.rows;
};

export const createCategory = async ({ name, type }) => {
    const result = await pool.query(
        `INSERT INTO categories (name, type)
        VALUES ($1, $2)
        RETURNING *`,
        [name, type]
    );
    return result.rows[0]; 
};

export const updateCategory = async (id, { name, type }) => {
    const result = await pool.query(
        `UPDATE categories
        SET name =  COALESCE($1, name), type = COALESCE($2, type)
        WHERE id = $3
        RETURNING *`,
        [name ?? null, type ?? null, id]
    );
    return result.rows[0] ?? null;
};

export const deleteCategory = async (id) => {
    const result = await pool.query(
        `DELETE FROM categories WHERE id = $1 RETURNING *`,
        [id]
    );
    return result.rows[0] ?? null;
};