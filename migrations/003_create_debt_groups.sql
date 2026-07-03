CREATE TABLE debt_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    monthly_payment_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);