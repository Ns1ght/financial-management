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