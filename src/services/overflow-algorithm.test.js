import { describe, it, expect } from 'vitest';
import { calculateOverflowAllocation } from './overflow-algorithm.js';

describe('calculateOverflowAllocation', () => {
  it('splits payment equally when no sub-debt closes out', () => {
    const result = calculateOverflowAllocation(900, [
      { id: 1, remaining_amount: 5000 },
      { id: 2, remaining_amount: 6000 },
      { id: 3, remaining_amount: 7000 },
    ]);

    expect(result).toEqual([
      { id: 1, amount_allocated: 300, remaining_after: 4700, paid_off: false },
      { id: 2, amount_allocated: 300, remaining_after: 5700, paid_off: false },
      { id: 3, amount_allocated: 300, remaining_after: 6700, paid_off: false },
    ]);
  });

  it('closes out a sub-debt and redistributes overflow to the rest', () => {
    const result = calculateOverflowAllocation(900, [
      { id: 1, remaining_amount: 200 },
      { id: 2, remaining_amount: 1200 },
      { id: 3, remaining_amount: 2000 },
    ]);

    expect(result).toEqual([
      { id: 1, amount_allocated: 200, remaining_after: 0, paid_off: true },
      { id: 2, amount_allocated: 350, remaining_after: 850, paid_off: false },
      { id: 3, amount_allocated: 350, remaining_after: 1650, paid_off: false },
    ]);
  });

  it('handles a cascading close-out across multiple sub-debts in one payment', () => {
    const result = calculateOverflowAllocation(900, [
      { id: 1, remaining_amount: 100 },
      { id: 2, remaining_amount: 350 },
      { id: 3, remaining_amount: 5000 },
    ]);

    expect(result).toEqual([
      { id: 1, amount_allocated: 100, remaining_after: 0, paid_off: true },
      { id: 2, amount_allocated: 350, remaining_after: 0, paid_off: true },
      { id: 3, amount_allocated: 450, remaining_after: 4550, paid_off: false },
    ]);
  });

  it('pays off the very last sub-debt exactly, leaving nothing active', () => {
    const result = calculateOverflowAllocation(500, [
      { id: 1, remaining_amount: 500 },
    ]);

    expect(result).toEqual([
      { id: 1, amount_allocated: 500, remaining_after: 0, paid_off: true },
    ]);
  });
});