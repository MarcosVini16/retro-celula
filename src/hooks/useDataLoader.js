import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { processData } from '../utils/dataProcessor';

export const useDataLoader = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDataFromFile();
  }, []);

  const loadDataFromFile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('celulas.csv');
      
      if (!response.ok) {
        throw new Error('Arquivo CSV não encontrado. Certifique-se de que o arquivo está em /public/assets/celulas.csv');
      }

      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const processedData = processData(results.data);
          setData(processedData);
          setIsLoading(false);
        },
        error: (error) => {
          console.error('Erro ao processar CSV:', error);
          setError('Erro ao processar o arquivo CSV.');
          setIsLoading(false);
        }
      });
    } catch (err) {
      console.error('Erro ao carregar arquivo:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file) => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const processedData = processData(results.data);
        setData(processedData);
        setIsLoading(false);
      },
      error: (error) => {
        console.error('Erro ao processar arquivo:', error);
        setError('Erro ao processar o arquivo CSV.');
        setIsLoading(false);
      }
    });
  };

  return { data, isLoading, error, handleFileUpload };
};