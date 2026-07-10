import pool from '../config/db.js';

export const getAllDebtGroups = async () => {
    const result = await pool.query(
        `SELECT * FROM debt_groups ORDER BY created_at DESC`
    );
    return result.rows;
};

export const getDebtGroupById = async (id) => {
    const groupResult = await pool.query(
        `SELECT * FROM debt_groups WHERE id = $1`,
        [id]
    );

    if (groupResult.rows.length === 0) {
        return null;
    }

    const group = groupResult.rows[0];

    const subDebtsResult = await pool.query(
        `SELECT * FROM sub_debts WHERE debt_group_id = $1 ORDER BY id ASC`,
        [id]
    );

    return {
        ...group,
        sub_debts: subDebtsResult.rows,
    };
};

