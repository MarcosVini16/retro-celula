// src/utils/dataProcessor.js - VERSÃO CORRIGIDA

// Função para extrair apenas a DATA do timestamp, ignorando fuso horário
const extractDateOnly = (timestamp) => {
  if (!timestamp) return null;
  
  // Parse do timestamp para pegar a data/hora
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return null;
  
  // IMPORTANTE: Extrair ano, mês e dia em HORÁRIO LOCAL (não UTC)
  // Isso evita problemas de fuso horário onde 20/04 vira 21/04
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

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

    const dateStr = extractDateOnly(timestamp);
    if (!dateStr) return;
    
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
    a.data.localeCompare(b.data)
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
  console.log('calculateStats - filteredData:', filteredData);
  console.log('calculateStats - length:', filteredData?.length);
  
  if (!filteredData || filteredData.length === 0) return null;

  const totalParticipantes = filteredData.reduce((sum, d) => sum + (d.participantes || 0), 0);
  console.log('totalParticipantes:', totalParticipantes);
  
  const mediaParticipantes = (totalParticipantes / filteredData.length).toFixed(1);
  console.log('mediaParticipantes:', mediaParticipantes);
  
  const maxParticipantes = Math.max(...filteredData.map(d => d.participantes || 0));
  const minParticipantes = Math.min(...filteredData.map(d => d.participantes || 0));
  
  const totalConversoes = filteredData.reduce((sum, d) => sum + (d.conversoes || 0), 0);
  const totalArena = filteredData.reduce((sum, d) => sum + (d.arenaFreq || 0), 0);
  const totalDomingo = filteredData.reduce((sum, d) => sum + (d.domingoFreq || 0), 0);
  const totalPD = filteredData.reduce((sum, d) => sum + (d.ofertas || 0), 0);

  const result = {
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
  
  console.log('calculateStats - result:', result);
  return result;
};

// Pega o início da semana (domingo) de uma data string YYYY-MM-DD
const getWeekStart = (dateStr) => {
  // Criar data em horário local, não UTC
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day); // mês é 0-indexed
  
  const dayOfWeek = d.getDay();
  const diff = d.getDate() - dayOfWeek;
  
  const weekStart = new Date(year, month - 1, diff);
  
  // Retornar string no formato YYYY-MM-DD
  const y = weekStart.getFullYear();
  const m = String(weekStart.getMonth() + 1).padStart(2, '0');
  const dy = String(weekStart.getDate()).padStart(2, '0');
  
  return `${y}-${m}-${dy}`;
};

// Agregar dados por semana SOMANDO valores de múltiplas células
const aggregateByWeek = (data) => {
  const weekMap = new Map();
  
  data.forEach(d => {
    const weekKey = getWeekStart(d.data);
    
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        participantes: 0,
        conversoes: 0,
        arena: 0,
        domingo: 0,
        dateStr: weekKey,
        count: 0
      });
    }
    
    const week = weekMap.get(weekKey);
    week.participantes += d.participantes || 0;
    week.conversoes += d.conversoes || 0;
    week.arena += d.arenaFreq || 0;
    week.domingo += d.domingoFreq || 0;
    week.count += 1;
  });
  
  return Array.from(weekMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, values]) => {
      // Converter de volta para formato de exibição
      const [year, month, day] = values.dateStr.split('-').map(Number);
      const displayDate = new Date(year, month - 1, day);
      
      return {
        data: displayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        Participantes: values.participantes,
        Conversões: values.conversoes,
        Arena: values.arena,
        Domingo: values.domingo
      };
    });
};

// Contar quantas células únicas estão nos dados
const countUniqueCelulas = (data) => {
  return new Set(data.map(d => d.celula)).size;
};

// OTIMIZAÇÃO: Preparar dados do gráfico com agregação inteligente
export const prepareChartData = (filteredData) => {
  if (!filteredData || filteredData.length === 0) return [];
  
  const uniqueCelulas = countUniqueCelulas(filteredData);
  
  // Se está vendo múltiplas células, SEMPRE agregar por semana
  if (uniqueCelulas > 1) {
    return aggregateByWeek(filteredData);
  }
  
  // Se é apenas UMA célula, mostrar dados individuais
  // mas limitar pontos se tiver muitos
  if (filteredData.length <= 50) {
    return filteredData.map(d => {
      // Converter string YYYY-MM-DD para exibição DD/MM
      const [year, month, day] = d.data.split('-').map(Number);
      const displayDate = new Date(year, month - 1, day);
      
      return {
        data: displayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        Participantes: d.participantes || 0,
        Conversões: d.conversoes || 0,
        Arena: d.arenaFreq || 0,
        Domingo: d.domingoFreq || 0
      };
    });
  }
  
  // Se uma célula com muitos dados, ainda agregar por semana
  return aggregateByWeek(filteredData);
};