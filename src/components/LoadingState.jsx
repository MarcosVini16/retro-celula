import React from 'react';
import { RefreshCw, AlertCircle, Upload } from 'lucide-react';

export const LoadingSpinner = React.memo(() => (
  <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 mb-8 text-center">
    <RefreshCw className="mx-auto mb-4 text-indigo-600 animate-spin" size={48} />
    <p className="text-xl text-gray-700 font-semibold">Carregando dados...</p>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

export const ErrorState = React.memo(({ error, onFileUpload }) => {
  const handleFileChange = (e) => {
    onFileUpload(e.target.files[0]);
  };

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-3xl shadow-xl p-8 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="text-red-600" size={32} />
        <h2 className="text-xl font-bold text-red-800">Erro ao Carregar Dados</h2>
      </div>
      <p className="text-red-700 mb-6">{error}</p>
      <div className="space-y-4">
        <p className="text-gray-700 mb-3 font-medium">Faça upload manual do CSV:</p>
        <label className="block">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer hover:bg-indigo-700 transition-all shadow-lg inline-flex items-center gap-2">
            <Upload size={20} />
            Selecionar Arquivo CSV
          </div>
        </label>
      </div>
    </div>
  );
});

ErrorState.displayName = 'ErrorState';