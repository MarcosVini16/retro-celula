import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';

const Filters = React.memo(({ 
  equipes, 
  celulas, 
  selectedEquipe, 
  selectedCelula, 
  startDate, 
  endDate,
  onEquipeChange,
  onCelulaChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
  isProcessing
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Calendar size={28} className="text-indigo-600" />
        Filtros
        {isProcessing && (
          <span className="ml-2 text-sm text-gray-500 animate-pulse">Processando...</span>
        )}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Equipe
          </label>
          <select
            value={selectedEquipe}
            onChange={(e) => onEquipeChange(e.target.value)}
            disabled={isProcessing}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50"
          >
            <option value="">Todas as Equipes</option>
            {equipes.map(equipe => (
              <option key={equipe} value={equipe}>{equipe}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Célula
          </label>
          <select
            value={selectedCelula}
            onChange={(e) => onCelulaChange(e.target.value)}
            disabled={isProcessing}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50"
          >
            <option value="">Todas as Células</option>
            {celulas.map(celula => (
              <option key={celula} value={celula}>{celula}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Data Início
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            disabled={isProcessing}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Data Fim
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            disabled={isProcessing}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50"
          />
        </div>
      </div>
      <button
        onClick={onClearFilters}
        disabled={isProcessing}
        className="mt-4 text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-2 hover:gap-3 transition-all disabled:opacity-50"
      >
        <RefreshCw size={18} className={isProcessing ? 'animate-spin' : ''} />
        Limpar Filtros
      </button>
    </div>
  );
});

Filters.displayName = 'Filters';

export default Filters;