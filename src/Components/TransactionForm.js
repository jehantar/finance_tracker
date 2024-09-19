import React, { useState } from 'react';
import { createTransaction } from '../Utils/supabaseClient';
import validator from 'validator';

const TransactionForm = ({ onTransactionCreated }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const validateAndSanitizeInputs = () => {
    let errors = [];
    let sanitizedDescription = validator.trim(description);
    let sanitizedAmount = validator.trim(amount);

    if (validator.isEmpty(sanitizedDescription)) {
      errors.push('Description is required');
    } else if (!validator.isLength(sanitizedDescription, { min: 3, max: 100 })) {
      errors.push('Description must be between 3 and 100 characters');
    }

    if (validator.isEmpty(sanitizedAmount)) {
      errors.push('Amount is required');
    } else if (!validator.isFloat(sanitizedAmount, { min: 0.01 })) {
      errors.push('Amount must be a valid positive number');
    }

    if (errors.length > 0) {
      setError(errors.join('. '));
      return null;
    }

    return {
      description: validator.escape(sanitizedDescription),
      amount: parseFloat(sanitizedAmount)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validatedData = validateAndSanitizeInputs();
    if (!validatedData) return;

    const transactionData = {
      ...validatedData,
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
          maxLength={100}
        />
      </div>
      <div>
        <label>Amount:</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <button type="submit">Add Transaction</button>
    </form>
  );
};

export default TransactionForm;