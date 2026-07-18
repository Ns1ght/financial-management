import { id } from "zod/locales";
import pool from "../config/db.js";

export const getAllTransactions = async () => {
    const result = await pool.query(
        `SELECT
            t.id,
            t.description,
            t.amount,
            t.type,
            t.date,
            t.category_id,
            c.name AS category_name
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        ORDER BY t.date DESC`
    ); 
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