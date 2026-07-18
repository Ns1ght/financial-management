import { id } from "zod/locales";
import pool from "../config/db.js";

export const getAllTransactions = async (filters = {}) => {
  const { category_id, type, start_date, end_date, limit = 50, offset = 0 } = filters;

  const conditions = [];
  const values = [];

  if (category_id) {
    values.push(category_id);
    conditions.push(`t.category_id = $${values.length}`);
  }

  if (type) {
    values.push(type);
    conditions.push(`t.type = $${values.length}`);
  }

  if (start_date) {
    values.push(start_date);
    conditions.push(`t.date >= $${values.length}`);
  }

  if (end_date) {
    values.push(end_date);
    conditions.push(`t.date <= $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  values.push(limit);
  const limitParam = `$${values.length}`;

  values.push(offset);
  const offsetParam = `$${values.length}`;

  const query = `
    SELECT
      t.id, t.description, t.amount, t.type, t.date, t.category_id,
      c.name AS category_name
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    ${whereClause}
    ORDER BY t.date DESC
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const result = await pool.query(query, values);
  return result.rows;
};

export const createTransaction = async ({ description, amount, type, date, category_id }) => {
    const result = await pool.query(
        `INSERT INTO transactions (description, amount, type, date, category_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [description, amount, type, date, category_id]
    ); 
    return result.rows[0];
};

export const getTransactionById = async (id) => {
    const result = await pool.query(
        `SELECT * FROM transactions WHERE id = $1`,
        [id]
    );
    return result.rows[0] ?? null;
};

export const updateTransaction = async (id, { description, amount, type, date, category_id }) => {
  const result = await pool.query(
    `UPDATE transactions
     SET
       description = COALESCE($1, description),
       amount = COALESCE($2, amount),
       type = COALESCE($3, type),
       date = COALESCE($4, date),
       category_id = COALESCE($5, category_id)
     WHERE id = $6
     RETURNING *`,
    [description ?? null, amount ?? null, type ?? null, date ?? null, category_id ?? null, id]
  );
  return result.rows[0] ?? null;
};

export const deleteTransaction = async (id) => {
  const result = await pool.query(
    `DELETE FROM transactions WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] ?? null;
};