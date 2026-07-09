import pool from '../config/db.js';

const run = async () => {
  // 1. Create the "Debt Payment" category
  const categoryResult = await pool.query(
    `INSERT INTO categories (name, type) VALUES ('Debt Payment', 'expense') RETURNING *`
  );
  const category = categoryResult.rows[0];
  console.log('Category created:', category);

  // 2. Create the debt group (R$900/month, linked to that category)
  const groupResult = await pool.query(
    `INSERT INTO debt_groups (name, monthly_payment_amount, category_id)
     VALUES ('Consolidated Personal Debt', 900.00, $1)
     RETURNING *`,
    [category.id]
  );
  const group = groupResult.rows[0];
  console.log('Debt group created:', group);

  // 3. Create the three sub-debts (same scenario we tested the pure algorithm with)
  const subDebtsData = [
    { name: 'Item A', amount: 200 },
    { name: 'Item B', amount: 1200 },
    { name: 'Item C', amount: 2000 },
  ];

  for (const debt of subDebtsData) {
    const result = await pool.query(
      `INSERT INTO sub_debts (debt_group_id, name, original_amount, remaining_amount)
       VALUES ($1, $2, $3, $3)
       RETURNING *`,
      [group.id, debt.name, debt.amount]
    );
    console.log('Sub-debt created:', result.rows[0]);
  }

  process.exit(0);
};

run();