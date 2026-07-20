import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function RecentTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/transactions?limit=5`, {cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setTransactions(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading recent transactions...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <ul className="transaction-list">
      {transactions.map((t) => (
        <li key={t.id} className="transaction-item">
          <div className="transaction-info">
            <span className="transaction-description">{t.description}</span>
            <span className="transaction-meta">
              {t.date.slice(0, 10)} · {t.category_name}
            </span>
          </div>
          <span className={`transaction-amount ${t.type}`}>
            {t.type === 'expense' ? '-' : '+'}R$ {Number(t.amount).toFixed(2)}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default RecentTransactions