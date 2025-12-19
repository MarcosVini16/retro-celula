import React, { useState, useMemo, useEffect } from 'react';
import { Upload, Calendar, TrendingUp, Users, BarChart3, Award, DollarSign, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

export default function RetroCelula() {
  const [data, setData] = useState([]);
  const [selectedCelula, setSelectedCelula] = useState('');
  const [selectedEquipe, setSelectedEquipe] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
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
        setIsLoading(false);
      }
    });
  };

  const processData = (rawData) => {
    const dataMap = new Map();
    
    rawData.forEach(row => {
      const timestamp = row['Timestamp'];
      const equipe = row['Identifique sua equipe 🧑‍🧑‍🧒‍🧒'];
      const celula = row['Identifique sua célula 🏡'];
      const participantes = parseInt(row['Quantas pessoas participaram da célula nesta semana?']) || 0;
      const conversoes = parseInt(row['Quantas conversões nesta semana em sua célula?']) || 0;
      const arenaFreq = parseInt(row['Qual foi a arregimentação de sua célula no Arena dessa semana?']) || 0;
      const domingoFreq = parseInt(row['Qual foi a arregimentação de sua célula no Culto de Domingo dessa semana?']) || 0;
      const ofertas = parseFloat(row['Parceiros de Deus arrecadados na célula dessa semana? 💰\n(Escreva o valor em Reais conforme o exemplo: 75.50)']) || 0;
      
      if (!celula || !timestamp) return;

      // Converte timestamp para data
      const date = new Date(timestamp);
      const dateStr = date.toISOString().split('T')[0];
      
      // Cria chave única: célula + dia
      const key = `${celula.trim()}-${dateStr}`;
      
      // Mantém o registro mais recente (último timestamp do dia)
      const existing = dataMap.get(key);
      if (!existing || new Date(timestamp) > new Date(existing.timestamp)) {
        dataMap.set(key, {
          timestamp,
          equipe: equipe || 'Sem equipe',
          celula: celula.trim(),
          data: dateStr,
          participantes,
          conversoes,
          arenaFreq,
          domingoFreq,
          ofertas
        });
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.data) - new Date(b.data)
    );
  };

  const celulas = useMemo(() => {
    return [...new Set(data.map(d => d.celula))].sort();
  }, [data]);

  const equipes = useMemo(() => {
    return [...new Set(data.map(d => d.equipe))].sort();
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = data;

    if (selectedCelula) {
      filtered = filtered.filter(d => d.celula === selectedCelula);
    }

    if (selectedEquipe) {
      filtered = filtered.filter(d => d.equipe === selectedEquipe);
    }

    if (startDate) {
      filtered = filtered.filter(d => d.data >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(d => d.data <= endDate);
    }

    return filtered;
  }, [data, selectedCelula, selectedEquipe, startDate, endDate]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const totalParticipantes = filteredData.reduce((sum, d) => sum + d.participantes, 0);
    const mediaParticipantes = (totalParticipantes / filteredData.length).toFixed(1);
    const maxParticipantes = Math.max(...filteredData.map(d => d.participantes));
    const minParticipantes = Math.min(...filteredData.map(d => d.participantes));
    
    const totalConversoes = filteredData.reduce((sum, d) => sum + d.conversoes, 0);
    const totalArena = filteredData.reduce((sum, d) => sum + d.arenaFreq, 0);
    const totalDomingo = filteredData.reduce((sum, d) => sum + d.domingoFreq, 0);
    const totalOfertas = filteredData.reduce((sum, d) => sum + d.ofertas, 0);

    return {
      totalParticipantes,
      mediaParticipantes,
      maxParticipantes,
      minParticipantes,
      totalConversoes,
      totalArena,
      totalDomingo,
      totalOfertas,
      reunioes: filteredData.length
    };
  }, [filteredData]);

  const chartData = useMemo(() => {
    return filteredData.map(d => ({
      data: new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      Participantes: d.participantes,
      Conversões: d.conversoes,
      Arena: d.arenaFreq,
      Domingo: d.domingoFreq
    }));
  }, [filteredData]);

  const clearFilters = () => {
    setSelectedCelula('');
    setSelectedEquipe('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <BarChart3 size={56} className="text-yellow-300" />
            Retro-Célula
          </h1>
          <p className="text-blue-100 text-lg md:text-xl">Análise e estatísticas das Células</p>
        </div>

        {/* Upload Section */}
        {data.length === 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 text-center">
            <Upload className="mx-auto mb-4 text-indigo-600" size={72} />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Importar Dados</h2>
            <p className="text-gray-600 mb-6 text-lg">
              Faça upload do arquivo CSV do relatório semanal das Células
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold cursor-pointer hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-3 text-lg">
                <Upload size={24} />
                Selecionar Arquivo CSV
              </div>
            </label>
          </div>
        )}

        {/* Filters */}
        {data.length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar size={28} className="text-indigo-600" />
              Filtros
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Equipe
                </label>
                <select
                  value={selectedEquipe}
                  onChange={(e) => setSelectedEquipe(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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
                  onChange={(e) => setSelectedCelula(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="mt-4 text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-2 hover:gap-3 transition-all"
            >
              <RefreshCw size={18} />
              Limpar Filtros
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                <Users className="mb-2" size={36} />
                <p className="text-blue-100 text-sm mb-1 font-medium">Total Participantes</p>
                <p className="text-4xl font-bold">{stats.totalParticipantes}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
                <TrendingUp className="mb-2" size={36} />
                <p className="text-green-100 text-sm mb-1 font-medium">Média</p>
                <p className="text-4xl font-bold">{stats.mediaParticipantes}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                <Award className="mb-2" size={36} />
                <p className="text-purple-100 text-sm mb-1 font-medium">Conversões</p>
                <p className="text-4xl font-bold">{stats.totalConversoes}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
                <Calendar className="mb-2" size={36} />
                <p className="text-orange-100 text-sm mb-1 font-medium">Reuniões</p>
                <p className="text-4xl font-bold">{stats.reunioes}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
                <DollarSign className="mb-2" size={36} />
                <p className="text-emerald-100 text-sm mb-1 font-medium">Ofertas</p>
                <p className="text-4xl font-bold">R$ {stats.totalOfertas.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <p className="text-gray-600 text-sm mb-1 font-medium">Frequência Arena Total</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.totalArena}</p>
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <p className="text-gray-600 text-sm mb-1 font-medium">Frequência Domingo Total</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalDomingo}</p>
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <p className="text-gray-600 text-sm mb-1 font-medium">Máximo de Participantes</p>
                <p className="text-3xl font-bold text-green-600">{stats.maxParticipantes}</p>
              </div>
            </div>
          </>
        )}

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Evolução de Participantes</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="data" stroke="#666" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Participantes" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Conversões" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Frequência nos Eventos</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="data" stroke="#666" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Arena" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Domingo" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {data.length > 0 && filteredData.length === 0 && (
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
      </div>
    </div>
  );
}