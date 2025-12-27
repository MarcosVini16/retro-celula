import React from 'react';
import { Users, TrendingUp, Award, Calendar, DollarSign } from 'lucide-react';

const StatCard = React.memo(({ icon: Icon, label, value, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-xl p-6 text-white`}>
    <Icon className="mb-2" size={36} />
    <p className="text-white/90 text-sm mb-1 font-medium">{label}</p>
    <p className="text-4xl font-bold">{value}</p>
  </div>
));

StatCard.displayName = 'StatCard';

const StatsCards = React.memo(({ stats }) => {
  if (!stats) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard 
          icon={Users}
          label="Total Participantes"
          value={stats.totalParticipantes}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard 
          icon={TrendingUp}
          label="Média"
          value={stats.mediaParticipantes}
          gradient="from-green-500 to-green-600"
        />
        <StatCard 
          icon={Award}
          label="Conversões"
          value={stats.totalConversoes}
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard 
          icon={Calendar}
          label="Reuniões"
          value={stats.reunioes}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard 
          icon={DollarSign}
          label="Ofertas"
          value={`R$ ${stats.totalOfertas.toFixed(2)}`}
          gradient="from-emerald-500 to-emerald-600"
        />
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
  );
});

StatsCards.displayName = 'StatsCards';

export default StatsCards;