import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL

function AddTransaction() {
    const navigate = useNavigate()

    const [categories, setCategories] = useState([])
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [type, setType] = useState('expense')
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
    const [categoryId, setCategoryId] = useState('')

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch(`${API_URL}/categories`)
        .then((res) => res.json())
        .then((data) => setCategories(data))
        .catch((err) => setError(err.message))
    }, [])

    const filteredCategories = categories.filter((c) => c.type === type)

    const handleSubmit = (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            description,
            amount: Number(amount),
            type,
            date,
            category_id: Number(categoryId),
        }),
        })
        .then(async (res) => {
            const data = await res.json()
            if (!res.ok) {
            throw new Error(data.error || 'Failed to create transaction')
            }
            return data
        })
        .then(() => {
            navigate('/')
        })
        .catch((err) => {
            setError(err.message)
            setSubmitting(false)
        })
    }

    return (
        <div className="page">
        <header className="page-header">
            <h1>Add Transaction</h1>
        </header>

        <form className="card form" onSubmit={handleSubmit}>
            <label>
            Description
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            </label>

            <label>
            Amount
            <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
            />
            </label>

            <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
            </select>
            </label>

            <label>
            Date
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
            />
            </label>

            <label>
            Category
            <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
            >
                <option value="" disabled>Select a category</option>
                {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
            </label>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
            <Link to="/">Cancel</Link>
            <button type="submit" className="button" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Transaction'}
            </button>
            </div>
        </form>
        </div>
    )
}

export default AddTransaction