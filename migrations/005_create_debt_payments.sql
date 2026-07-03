CREATE TABLE debt_payments (
    id SERIAL PRIMARY KEY,
    debt_group_id INTEGER NOT NULL REFERENCES debt_groups(id),
    payment_date DATE NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);