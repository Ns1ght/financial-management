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

export const createDebtGroup = async ({ name, monthly_payment_amount, category_id, sub_debts }) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Insert the parent debt group
        const groupResult = await client.query(
            `INSERT INTO debt_groups (name, monthly_payment_amount, category_id)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [name, monthly_payment_amount, category_id]
        );
        const group = groupResult.rows[0];

        // 2. Insert each sub-debt, linked to the new group
        const createdSubDebts = [];
        for (const debt of sub_debts) {
            const result = await client.query(
                `INSERT INTO sub_debts (debt_group_id, name, original_amount, remaining_amount)
                VALUES ($1, $2, $3, $3)
                RETURNING *`,
                [group.id, debt.name, debt.original_amount]
            );
            createdSubDebts.push(result.rows[0]);
        }

        await client.query('COMMIT');

        return { ...group, sub_debts: createdSubDebts };
    } catch(err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

