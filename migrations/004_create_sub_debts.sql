CREATE TABLE sub_debts (
    id SERIAL PRIMARY KEY,
    debt_group_id INTEGER NOT NULL REFERENCES debt_groups(id),
    name VARCHAR(255) NOT NULL,
    original_amount NUMERIC(12, 2) NOT NULL,
    remaining_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid_off')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);