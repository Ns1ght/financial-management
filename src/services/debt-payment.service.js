import pool from '../config/db.js';
import { calculateOverflowAllocation } from './overflow.algorithm.js';

export const processDebtPayment = async ({ debt_group_id, payment_date}) => {
    const client = await pool.connect();

    try {
       await client.query('BEGIN');
       
       // 1. Fetch the debt group (need monthly_payment_amount)
       const groupResult = await client.query(
        `SELECT * FROM debt_groups WHERE id = $1`,
        [debt_group_id]
       );
       if (groupResult.rows.length === 0) {
        throw new Error(`Debt group ${debt_group_id} not found`);
       }
       const debtGroup = groupResult.rows[0];

       // 2. Fetch all active sub-debts for this group
       const subDebtsResult = await client.query(
        `SELECT id, remaining_amount FROM sub_debts
        WHERE debt_group_id = $1 AND status = 'active'
        ORDER BY id ASC`,
        [debt_group_id]        
       );
       const activeSubDebts = subDebtsResult.rows.map(d => ({
        id: d.id,
        remaining_amount: Number(d.remaining_amount),
       }));

       if (activeSubDebts.length === 0) {
        throw new Error(`No active sub-debts remaining for debt group ${debt_group_id}`);
       }

       // 3. Run the pure algorithm
       const allocations = calculateOverflowAllocation(
        Number(debtGroup.monthly_payment_amount),
        activeSubDebts
       );

       // 4. Insert the debt_payments row
       const paymentResult = await client.query(
        `INSERT INTO debt_payments (debt_group_id, payment_date, total_amount)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [debt_group_id, payment_date, debtGroup.monthly_payment_amount]
       );
       const debtPayment = paymentResult.rows[0];

       // 5. For each allocation: insert allocation row + update the sub-debt
       for (const alloc of allocations) {
            await client.query(
                `INSERT INTO debt_payment_allocations
                    (debt_payment_id, sub_debt_id, amount_allocated, remaining_after)
                VALUES ($1, $2, $3, $4)`, 
                [debtPayment.id, alloc.id, alloc.amount_allocated, alloc.remaining_after]
            );

            await client.query(
                `UPDATE sub_debts
                SET remaining_amount = $1, status = $2
                WHERE ID = $3`,
                [alloc.remaining_after, alloc.paid_off ? 'paid_off' : 'active', alloc.id]
            );
        }

        // 6. Insert one transaction row representing this payment as a whole
        //    Note: The category fot his has not been created yet - using a placeholder category_id for now    } catch (error) {
        await client.query(
            `INSERT INTO transactions (description, amount, type, date, category_id, debt_payment_id)
            VALUES ($1, $2, 'expense', $3, $4, $5)`, 
            [
                `Debt payment - ${debtGroup.name}`,
                debtGroup.monthly_payment_amount,
                payment_date,
                debtGroup.category_id, 
                debtPayment.id,
            ]
        );

        await client.query('COMMIT');

        return { debtPayment, allocations };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release()
    }
}