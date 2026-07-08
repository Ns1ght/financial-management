/**
 * Given the total payment amount and a list of active sub-debts,
 * returns how much each sub-debt should receive this cycle,
 * handling overflow when a sub-debt's remaining balance is
 * smaller than its equal share.
 * 
 * @param {number} totalPayment - The fixed monthly payment amount
 * @param {Array<{id: number, remaining_amount: number}>} activeSubDebts
 * @returns {Array<{id: number, amount_allocated: number, remaining_after: number, paid_off: boolean}>}
 */

export const calculateOverflowAllocation = (totalPayment, activeSubDebts) => {
    // Work on a mutable copy so we don't affect the callers array
    let pool = [...activeSubDebts];
    let remainingPayment = totalPayment;
    const allocations = [];

    while (pool.length > 0 && remainingPayment > 0) {
        const equalShare = Number((remainingPayment / pool.length).toFixed(2));

        // Find any sub-debts that would be fully paid off by their equal share
        const closingOut = pool.filter(d => d.remaining_amount <= equalShare);

        if (closingOut.length === 0) {
            // No one closes out this pass - everyone left just gets the equal share
            for (const debt of pool) {
                allocations.push({
                    id: debt.id,
                    amount_allocated: equalShare,
                    remaining_after: Number((debt.remaining_amount - equalShare).toFixed(2)),
                    paid_off: false,
                });
            }
            remainingPayment = 0; // fully distributed
            pool = [];
        } else {
            // Close out each of these sub-debts with exactly what they need
            for (const debt of closingOut) {
                allocations.push({
                    id: debt.id,
                    amount_allocated: debt.remaining_amount,
                    remaining_after: 0,
                    paid_off: true,
                });
                remainingPayment = Number((remainingPayment - debt.remaining_amount).toFixed(2));
            }
        
            // Remove closed sub-debts from the pool, then loop again
            // to redistribute what's left among whoever remains
            pool = pool.filter(d => !closingOut.includes(d))
        }
    }

    return allocations;
}