import pool from '../config/db.js';

export const getSubDebtsByGroupId = async (debtGroupId, client = pool) => {
    const result = await client.query(
        `SELECT * FROM sub_debts WHERE debt_group_id = $1 ORDER BY id ASC`,
        [debtGroupId]
    );
    return result.rows;
};

export const getActiveSubDebtsByGroupId = async (debtGroupId, client = pool) => {
    const result = await client.query(
        `SELECT * FROM sub_debts WHERE debt_group_id = $1 AND status = 'active' ORDER BY id ASC`,
        [debtGroupId]
    );
    return result.rows;   
}