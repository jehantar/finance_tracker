import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { supabase } from './supabaseClient';

const CSVUpload = () => {
  const [parsedData, setParsedData] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (!session) {
        console.log("User is not authenticated. Please sign in.");
        setUploadStatus("Please sign in to upload data.");
      }
    };
    checkAuth();
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    if (!isAuthenticated) {
        setUploadStatus("Please sign in to upload data.");
        return;
      }
  
      const file = acceptedFiles[0];
    
    Papa.parse(file, {
      complete: async (results) => {
        console.log('Parsed CSV data:', results.data);
        setParsedData(results.data);
        
        try {
          const transformedData = results.data.map(row => ({
            transaction_date: new Date(row['Transaction Date']).toISOString(),
            post_date: new Date(row['Post Date']).toISOString(),
            description: row['Description'],
            category: row['Category'],
            type: row['Type'],
            amount: parseFloat(row['Amount']),
            memo: row['Memo']
          }));

          console.log('Transformed data:', transformedData);
          console.log('Supabase URL:', supabase.supabaseUrl);
          console.log('Is authenticated:', isAuthenticated);

          const { data, error } = await supabase
            .from('transactions')
            .insert(transformedData);
          
          if (error) throw error;
          
          console.log('Inserted data:', data);
          setUploadStatus('Upload successful!');
        } catch (error) {
          console.error('Error details:', error);
          setUploadStatus(`Upload failed: ${error.message || 'Unknown error'}`);
        }
      },
      header: true,
      skipEmptyLines: true
    });
  }, [isAuthenticated]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <div {...getRootProps()} style={dropzoneStyles}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop the CSV file here ...</p> :
            <p>Drag 'n' drop a CSV file here, or click to select one</p>
        }
      </div>
      {uploadStatus && <p>{uploadStatus}</p>}
      {parsedData.length > 0 && (
        <div>
          <h3>Parsed Data Preview:</h3>
          <table>
            <thead>
              <tr>
                {Object.keys(parsedData[0]).map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsedData.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const dropzoneStyles = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer'
};

export default CSVUpload;