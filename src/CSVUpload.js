import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { supabase } from './Utils/supabaseClient';

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

  const columnMappings = {
    'Transaction Date': 'transaction_date',
    'Post Date': 'post_date',
    'Description': 'description',
    'Category': 'category',
    'Type': 'type',
    'Amount': 'amount',
    'Memo': 'memo'
  };

  const noHeadersColumnOrder = [
    'transaction_date',
    'amount',
    'type',
    'category',
    'description'
  ];

  const transformRow = (row, hasHeaders) => {
    const transformedRow = {};
    if (hasHeaders) {
      Object.keys(row).forEach(key => {
        const mappedKey = columnMappings[key] || key.toLowerCase().replace(/\s+/g, '_');
        let value = row[key];
        if (mappedKey === 'transaction_date' || mappedKey === 'post_date') {
          value = new Date(value).toISOString();
        } else if (mappedKey === 'amount') {
          value = parseFloat(value.replace(/[^\d.-]/g, ''));
        }
        transformedRow[mappedKey] = value;
      });
    } else {
      noHeadersColumnOrder.forEach((key, index) => {
        let value = row[index];
        if (key === 'transaction_date') {
          value = new Date(value).toISOString();
        } else if (key === 'amount') {
          value = parseFloat(value.replace(/[^\d.-]/g, ''));
        }
        transformedRow[key] = value;
      });
    }
    return transformedRow;
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (!isAuthenticated) {
      setUploadStatus("Please sign in to upload data.");
      return;
    }
  
    const file = acceptedFiles[0];
    
    Papa.parse(file, {
      complete: async (results) => {
        console.log('Parsed CSV data:', results.data);
        
        const hasHeaders = results.meta.fields && results.meta.fields.length > 0;
        const dataToProcess = hasHeaders ? results.data : results.data;
        
        setParsedData(dataToProcess);
        
        try {
          const transformedData = dataToProcess.map(row => transformRow(row, hasHeaders));

          console.log('Transformed data:', transformedData);
          console.log('Supabase URL:', supabase.supabaseUrl);
          console.log('Is authenticated:', isAuthenticated);

          // Insert data in smaller batches
          const batchSize = 100;
          for (let i = 0; i < transformedData.length; i += batchSize) {
            const batch = transformedData.slice(i, i + batchSize);
            const { data, error } = await supabase
              .from('transactions')
              .insert(batch);
            
            if (error) {
              console.error('Error details:', error);
              throw error;
            }
          }
          
          setUploadStatus('Upload successful!');
          
          // Verify the insertion by fetching the data
          const { data: verificationData, error: verificationError } = await supabase
            .from('transactions')
            .select('*')
            .order('transaction_date', { ascending: false })
            .limit(5);
          
          if (verificationError) {
            console.error('Verification error:', verificationError);
          } else {
            console.log('Verification data (last 5 entries):', verificationData);
          }
        } catch (error) {
          console.error('Error details:', error);
          setUploadStatus(`Upload failed: ${error.message || 'Unknown error'}`);
        }
      },
      header: false,
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
                {(parsedData[0] instanceof Array ? noHeadersColumnOrder : Object.keys(parsedData[0])).map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsedData.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  {(row instanceof Array ? row : Object.values(row)).map((cell, cellIndex) => (
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