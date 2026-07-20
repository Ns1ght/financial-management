import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AddTransaction from './pages/AddTransaction';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transactions/new" element={<AddTransaction />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App