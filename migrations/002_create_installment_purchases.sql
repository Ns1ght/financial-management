CREATE TABLE installment_purchases (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    installment_count INTEGER NOT NULL CHECK (installment_count > 0),
    installment_amount NUMERIC(12, 2) NOT NULL,
    first_due_date DATE NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);