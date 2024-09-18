import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ucneekhlpolpahgtcxsn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbmVla2hscG9scGFoZ3RjeHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1MjE1NzQsImV4cCI6MjA0MjA5NzU3NH0.VWQGko6F8ShFUnpBYYQYmHHsBssQznuXSnblb38fXXA'

export const supabase = createClient(supabaseUrl, supabaseKey)

export const getTransactions = async () => {
    console.log('Calling getTransactions...');
    try {
      // Log the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user ID:', user?.id);
  
      // Attempt to get the total count of transactions
      const { count, error: countError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });
  
      if (countError) {
        console.error('Error getting transaction count:', countError);
      } else {
        console.log('Total transaction count:', count);
      }
  
      // Now perform the actual query
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
       
  
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
  
      console.log(`Supabase response: ${data?.length} transactions retrieved`);
      if (data && data.length > 0) {
        console.log('First transaction:', data[0]);
      } else {
        console.log('No transactions found in the query result');
      }
  
      return data || [];
    } catch (error) {
      console.error('Error in getTransactions:', error);
      throw error;
    }
  }

export const deleteTransaction = async (id) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .match({ id });
  
  if (error) throw error;
}

export const updateTransaction = async (id, updates) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .match({ id });
  
  if (error) throw error;
  return data;
}

export const createTransaction = async (transactionData) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData]);

  if (error) throw error;
  return data;
}