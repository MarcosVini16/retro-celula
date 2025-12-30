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
    const PD = parseFloat(row['Parceiros de Deus arrecadados na célula dessa semana? 💰\n(Escreva o valor em Reais conforme o exemplo: 75.50)']) || 0;
    
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
        PD
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
  const totalPD = filteredData.reduce((sum, d) => sum + d.PD, 0);

  return {
    totalParticipantes,
    mediaParticipantes,
    maxParticipantes,
    minParticipantes,
    totalConversoes,
    totalArena,
    totalDomingo,
    totalPD,
    reunioes: filteredData.length
  };
};

// Pega o início da semana (domingo) de uma data
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

// Agregar dados por semana SOMANDO valores de múltiplas células
const aggregateByWeek = (data) => {
  const weekMap = new Map();
  
  data.forEach(d => {
    const weekStart = getWeekStart(d.data);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        participantes: 0,
        conversoes: 0,
        arena: 0,
        domingo: 0,
        date: weekStart,
        count: 0
      });
    }
    
    const week = weekMap.get(weekKey);
    week.participantes += d.participantes;
    week.conversoes += d.conversoes;
    week.arena += d.arenaFreq;
    week.domingo += d.domingoFreq;
    week.count += 1;
  });
  
  return Array.from(weekMap.entries())
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([key, values]) => ({
      data: values.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      Participantes: values.participantes,
      Conversões: values.conversoes,
      Arena: values.arena,
      Domingo: values.domingo
    }));
};

// Contar quantas células únicas estão nos dados
const countUniqueCelulas = (data) => {
  return new Set(data.map(d => d.celula)).size;
};

// OTIMIZAÇÃO: Preparar dados do gráfico com agregação inteligente
export const prepareChartData = (filteredData) => {
  if (filteredData.length === 0) return [];
  
  const uniqueCelulas = countUniqueCelulas(filteredData);
  
  // Se está vendo múltiplas células, SEMPRE agregar por semana
  if (uniqueCelulas > 1) {
    return aggregateByWeek(filteredData);
  }
  
  // Se é apenas UMA célula, mostrar dados individuais
  // mas limitar pontos se tiver muitos
  if (filteredData.length <= 50) {
    return filteredData.map(d => ({
      data: new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      Participantes: d.participantes,
      Conversões: d.conversoes,
      Arena: d.arenaFreq,
      Domingo: d.domingoFreq
    }));
  }
  
  // Se uma célula com muitos dados, ainda agregar por semana
  return aggregateByWeek(filteredData);
};