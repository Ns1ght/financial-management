import pool from '../config/db.js'

export const getMonthlySummary = async (month) => {
    // month is expected as YYYY-MM
    const result = await pool.query(
        `SELECT 
            COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) AS total_income,
            COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS total_expense
        FROM transactions
        WHERE to_char(date, 'YYYY-MM') = $1`,
        [month]
    );

    const { total_income, total_expense } = result.rows[0];
    return {
        month,
        total_income: Number(total_income),
        total_expense: Number(total_expense),
        net: Number(total_income) - Number(total_expense),
    };
};

export const getCategorySummary = async (month) => {
    const result = await pool.query(
        `SELECT
        c.id AS category_id,
        c.name AS category_name,
        c.type,
        COALESCE(SUM(t.amount), 0) AS total
        FROM categories c
        LEFT JOIN transactions t
        ON t.category_id = c.id AND to_char(t.date, 'YYYY-MM') = $1
        GROUP BY c.id, c.name, c.type
        ORDER BY total DESC`,
        [month]
    );

    return result.rows.map(row => ({
        ...row,
        total: Number(row.total),
    }));
};