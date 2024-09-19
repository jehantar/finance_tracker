import React, { useState, useEffect } from 'react';
import { supabase } from './Utils/supabaseClient.js';
import Auth from './Auth.js';
import CSVUpload from './CSVUpload';
import TransactionsPage from './Pages/TransactionsPage';
import Visualizations from './Components/Visualizations';

function App() {
  const [session, setSession] = useState(null);
  const [currentPage, setCurrentPage] = useState('csv');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Fetch transactions when the component mounts
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*');
      
      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  const renderPage = () => {
    if (!session) {
      return <Auth />;
    }
    switch(currentPage) {
      case 'csv':
        return <CSVUpload />;
      case 'transactions':
        return <TransactionsPage transactions={transactions} />;
      case 'visualizations':
        return <Visualizations transactions={transactions} />;
      default:
        return <CSVUpload />;
    }
  };

  return (
    <div className="App">
      <h1>Personal Finance App</h1>
      {session && (
        <nav>
          <button onClick={() => setCurrentPage('csv')}>CSV Upload</button>
          <button onClick={() => setCurrentPage('transactions')}>Transactions</button>
          <button onClick={() => setCurrentPage('visualizations')}>Visualizations</button>
          <button onClick={handleLogout}>Logout</button>
        </nav>
      )}
      {renderPage()}
    </div>
  );
}

export default App;