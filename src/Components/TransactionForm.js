import React, { useState } from 'react';
import { createTransaction } from '../Utils/supabaseClient';

const TransactionForm = ({ onTransactionCreated }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!amount || isNaN(parseFloat(amount))) {
      setError('Valid amount is required');
      return;
    }

    const transactionData = {
      description: description.trim(),
      amount: parseFloat(amount),
      transaction_date: new Date().toISOString(),
    };

    try {
      await createTransaction(transactionData);
      onTransactionCreated();
      setDescription('');
      setAmount('');
    } catch (error) {
      console.error('Error creating transaction:', error);
      setError('Failed to create transaction. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label>Amount:</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <button type="submit">Add Transaction</button>
    </form>
  );
};

export default TransactionForm;