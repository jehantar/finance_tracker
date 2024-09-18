import React, { useState } from 'react';
import { deleteTransaction } from '../Utils/supabaseClient';

const TransactionList = ({ transactions, onTransactionDeleted }) => {
  const [sortField, setSortField] = useState('transaction_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filter, setFilter] = useState('');

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      onTransactionDeleted();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedTransactions = transactions
    .filter(transaction => 
      transaction.description.toLowerCase().includes(filter.toLowerCase()) ||
      transaction.amount.toString().includes(filter)
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div>
      <input 
        type="text" 
        placeholder="Filter transactions..." 
        value={filter} 
        onChange={(e) => setFilter(e.target.value)} 
      />
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('transaction_date')}>Date</th>
            <th onClick={() => handleSort('description')}>Description</th>
            <th onClick={() => handleSort('amount')}>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedTransactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
              <td>{transaction.description}</td>
              <td>${transaction.amount.toFixed(2)}</td>
              <td>
                <button onClick={() => handleDelete(transaction.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;