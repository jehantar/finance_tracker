import React, { useState, useEffect } from 'react';
import { supabase } from './Utils/supabaseClient.js';
import Auth from './Auth.js';
import CSVUpload from './CSVUpload';
import TransactionsPage from './Pages/TransactionsPage'; // Import the TransactionsPage component

function App() {
  const [session, setSession] = useState(null);
  const [currentPage, setCurrentPage] = useState('csv'); // Add state for current page

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const renderPage = () => {
    if (!session) {
      return <Auth />;
    }
    switch(currentPage) {
      case 'csv':
        return <CSVUpload />;
      case 'transactions':
        return <TransactionsPage />;
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
        </nav>
      )}
      {renderPage()}
    </div>
  );
}

export default App;