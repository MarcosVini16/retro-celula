import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const tooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const ParticipantsChart = React.memo(({ data, isAggregated }) => (
  <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
    <div className="mb-6">
      <h3 className="text-xl md:text-2xl font-bold text-gray-800">
        Evolução de Participantes
      </h3>
      {isAggregated && (
        <p className="text-sm text-gray-500 mt-1">
          Dados agregados por semana (somando todas as células selecionadas)
        </p>
      )}
    </div>
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="data" stroke="#666" style={{ fontSize: '12px' }} />
        <YAxis stroke="#666" style={{ fontSize: '12px' }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        <Line type="monotone" dataKey="Participantes" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
        <Line type="monotone" dataKey="Conversões" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
));

ParticipantsChart.displayName = 'ParticipantsChart';

const EventsChart = React.memo(({ data, isAggregated }) => (
  <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
    <div className="mb-6">
      <h3 className="text-xl md:text-2xl font-bold text-gray-800">
        Frequência nos Eventos
      </h3>
      {isAggregated && (
        <p className="text-sm text-gray-500 mt-1">
          Dados agregados por semana (somando todas as células selecionadas)
        </p>
      )}
    </div>
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="data" stroke="#666" style={{ fontSize: '12px' }} />
        <YAxis stroke="#666" style={{ fontSize: '12px' }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        <Bar dataKey="Arena" fill="#f59e0b" radius={[8, 8, 0, 0]} />
        <Bar dataKey="Domingo" fill="#10b981" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
));

EventsChart.displayName = 'EventsChart';

const Charts = React.memo(({ chartData, isAggregated }) => {
  if (chartData.length === 0) return null;

  return (
    <div className="space-y-6">
      <ParticipantsChart data={chartData} isAggregated={isAggregated} />
      <EventsChart data={chartData} isAggregated={isAggregated} />
    </div>
  );
});

Charts.displayName = 'Charts';

export default Charts;