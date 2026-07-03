import pool from "../config/db.js";

export const createInstallmentPurchase = async ({
    description,
    total_amount,
    installment_count,
    first_due_date,
    category_id,
}) => {
    // Round to 2 decimals to avoid floating point weirdness with money
    const installment_amount = Number((total_amount / installment_count).toFixed(2));

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Insert the parent record
        const purchaseResult = await client.query(
            `INSERT INTO installment_purchases
                (description, total_amount, installment_count, installment_amount, first_due_date, category_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [description, total_amount, installment_count, installment_amount, first_due_date, category_id]
        );
        const purchase = purchaseResult.rows[0];
        
        // 2. Generate N monthly transactions rows
        const transactions = [];
        const baseDate = new Date(first_due_date);

        for (let i = 0; i < installment_count; i++) {
            const dueDate = new Date(baseDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            const dueDateStr = dueDate.toISOString().split('T')[0]; // YYY-MM-DD

            const txResult = await client.query(
                `INSERT INTO transactions
                    (description, amount, type, date, category_id, installment_purchase_id, installment_number)
                VALUES ($1, $2, 'expense', $3, $4, $5, $6)
                RETURNING *`,
                [
                    `${description} (${i + 1}/${installment_count})`,
                    installment_amount,
                    dueDateStr,
                    category_id,
                    purchase.id,
                    i + 1,
                ]
            );
            transactions.push(txResult.rows[0]);
        }

        await client.query('COMMIT');

        return {purchase, transactions };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};