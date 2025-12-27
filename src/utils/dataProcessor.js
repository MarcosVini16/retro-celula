export const processData = (rawData) => {
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

    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0];
    
    const key = `${celula.trim()}-${dateStr}`;
    
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

export const filterData = (data, filters) => {
  const { selectedCelula, selectedEquipe, startDate, endDate } = filters;
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
};

export const calculateStats = (filteredData) => {
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
};

// NOVA FUNÇÃO: Agregar dados por semana quando há muitos pontos
const aggregateByWeek = (data) => {
  const weekMap = new Map();
  
  data.forEach(d => {
    const date = new Date(d.data);
    // Pega o início da semana (domingo)
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        participantes: [],
        conversoes: [],
        arena: [],
        domingo: [],
        date: weekStart
      });
    }
    
    const week = weekMap.get(weekKey);
    week.participantes.push(d.participantes);
    week.conversoes.push(d.conversoes);
    week.arena.push(d.arenaFreq);
    week.domingo.push(d.domingoFreq);
  });
  
  return Array.from(weekMap.entries()).map(([key, values]) => ({
    data: values.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    Participantes: Math.round(values.participantes.reduce((a, b) => a + b, 0) / values.participantes.length),
    Conversões: Math.round(values.conversoes.reduce((a, b) => a + b, 0)),
    Arena: Math.round(values.arena.reduce((a, b) => a + b, 0) / values.arena.length),
    Domingo: Math.round(values.domingo.reduce((a, b) => a + b, 0) / values.domingo.length)
  }));
};

// OTIMIZAÇÃO: Limitar pontos no gráfico para melhor performance
export const prepareChartData = (filteredData) => {
  // Se tiver poucos dados, mostrar todos
  if (filteredData.length <= 50) {
    return filteredData.map(d => ({
      data: new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      Participantes: d.participantes,
      Conversões: d.conversoes,
      Arena: d.arenaFreq,
      Domingo: d.domingoFreq
    }));
  }
  
  // Se tiver entre 50-150 pontos, pegar a cada 2
  if (filteredData.length <= 150) {
    return filteredData
      .filter((_, index) => index % 2 === 0)
      .map(d => ({
        data: new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        Participantes: d.participantes,
        Conversões: d.conversoes,
        Arena: d.arenaFreq,
        Domingo: d.domingoFreq
      }));
  }
  
  // Se tiver muitos dados (>150), agregar por semana
  return aggregateByWeek(filteredData);
};
