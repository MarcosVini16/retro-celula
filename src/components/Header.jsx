import React from 'react';
import { BarChart3 } from 'lucide-react';

const Header = React.memo(() => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 flex items-center justify-center gap-3">
        <BarChart3 size={56} className="text-yellow-300" />
        Retro-Célula
      </h1>
      <p className="text-blue-100 text-lg md:text-xl">Análise e estatísticas das Células</p>
    </div>
  );
});

Header.displayName = 'Header';

export default Header;