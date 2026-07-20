import { useState, useEffect } from "react"

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/transactions`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }
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

  if (loading) return <p>Loading transactions...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h1>Financial Management</h1>
      <h2>Transactions</h2>
      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            {t.date.slice(0, 10)} — {t.description} — {t.type === 'expense' ? '-' : '+'}
            R$ {t.amount}
            {' '}({t.category_name})
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App