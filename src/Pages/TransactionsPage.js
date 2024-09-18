import React, { useState, useEffect } from 'react';
import { getTransactions } from '../Utils/supabaseClient';
import TransactionList from '../Components/TransactionList';
import TransactionForm from '../Components/TransactionForm';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      console.log('Fetched transactions:', data);
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleTransactionCreated = () => {
    fetchTransactions();
  };

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Transactions</h2>
      <TransactionForm onTransactionCreated={handleTransactionCreated} />
      {transactions.length > 0 ? (
        <TransactionList 
          transactions={transactions} 
          onTransactionDeleted={fetchTransactions}
        />
      ) : (
        <p>No transactions found. If you've just uploaded data, please refresh the page.</p>
      )}
    </div>
  );
};

export default TransactionsPage;