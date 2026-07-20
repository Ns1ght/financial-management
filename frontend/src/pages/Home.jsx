import { Link } from 'react-router-dom'
import RecentTransactions from '../components/RecentTransactions'

function Home() {
    return (
        <div className='page'>
            <header className='page-header'>
                <h1>Financial Management</h1>
            </header>

            <section className='card'>
                <div className='card-header'>
                    <h2>Recent Transactions</h2>
                    <Link to='/transactions/new' className='button'> 
                        + Add Transaction
                    </Link>
                </div>
                <RecentTransactions />
            </section>
        </div>
    )
}

export default Home