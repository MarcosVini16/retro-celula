import React, { useState, useMemo, useTransition } from 'react';
import Header from './components/Header';
import Filters from './components/Filters';
import StatsCards from './components/StatsCards';
import Charts from './components/Charts';
import { LoadingSpinner, ErrorState } from './components/LoadingState';
import { useDataLoader } from './hooks/useDataLoader';
import { useDebounce } from './hooks/useDebounce';
import { filterData, calculateStats, prepareChartData } from './utils/dataProcessor';

function App() {
  const { data, isLoading, error, handleFileUpload } = useDataLoader();
  
  // Estados dos filtros
  const [selectedCelula, setSelectedCelula] = useState('');
  const [selectedEquipe, setSelectedEquipe] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // useTransition para melhorar UX em atualizações pesadas
  const [isPending, startTransition] = useTransition();

  // Debounce nas datas para evitar processamento excessivo
  const debouncedStartDate = useDebounce(startDate, 300);
  const debouncedEndDate = useDebounce(endDate, 300);

  const celulas = useMemo(() => {
    return [...new Set(data.map(d => d.celula))].sort();
  }, [data]);

  const equipes = useMemo(() => {
    return [...new Set(data.map(d => d.equipe))].sort();
  }, [data]);

  // Filtrar dados com debounce nas datas
  const filteredData = useMemo(() => {
    return filterData(data, { 
      selectedCelula, 
      selectedEquipe, 
      startDate: debouncedStartDate, 
      endDate: debouncedEndDate 
    });
  }, [data, selectedCelula, selectedEquipe, debouncedStartDate, debouncedEndDate]);

  const stats = useMemo(() => {
    return calculateStats(filteredData);
  }, [filteredData]);

  const chartData = useMemo(() => {
    return prepareChartData(filteredData);
  }, [filteredData]);

  // Handlers com transition para não bloquear a UI
  const handleEquipeChange = (value) => {
    startTransition(() => {
      setSelectedEquipe(value);
    });
  };

  const handleCelulaChange = (value) => {
    startTransition(() => {
      setSelectedCelula(value);
    });
  };

  const handleStartDateChange = (value) => {
    setStartDate(value); // Sem transition aqui porque o debounce já cuida
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
  };

  const clearFilters = () => {
    startTransition(() => {
      setSelectedCelula('');
      setSelectedEquipe('');
      setStartDate('');
      setEndDate('');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />

        {isLoading && <LoadingSpinner />}
        
        {error && <ErrorState error={error} onFileUpload={handleFileUpload} />}

        {!isLoading && !error && data.length > 0 && (
          <>
            <Filters
              equipes={equipes}
              celulas={celulas}
              selectedEquipe={selectedEquipe}
              selectedCelula={selectedCelula}
              startDate={startDate}
              endDate={endDate}
              onEquipeChange={handleEquipeChange}
              onCelulaChange={handleCelulaChange}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
              onClearFilters={clearFilters}
              isProcessing={isPending}
            />

            {/* Mostrar stats e gráficos mesmo durante processamento, mas com opacidade */}
            <div className={isPending ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
              <StatsCards stats={stats} />
              <Charts chartData={chartData} />
            </div>

            {filteredData.length === 0 && !isPending && (
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center">
                <p className="text-xl text-gray-600">Nenhum dado encontrado com os filtros selecionados.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;