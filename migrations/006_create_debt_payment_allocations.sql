CREATE TABLE debt_payment_allocations (
    id SERIAL PRIMARY KEY,
    debt_payment_id INTEGER NOT NULL REFERENCES debt_payments(id),
    sub_debt_id INTEGER NOT NULL REFERENCES sub_debts(id),
    amount_allocated NUMERIC(12, 2) NOT NULL,
    remaining_after NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);