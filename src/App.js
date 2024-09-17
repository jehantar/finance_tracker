import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth.js';
import CSVUpload from './CSVUpload';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <div className="App">
      <h1>Personal Finance App</h1>
      {!session ? (
        <Auth />
      ) : (
        <CSVUpload />
      )}
    </div>
  );
}

export default App;