import React from 'react';
import { KelegramApp } from './kelegram/KelegramApp';

export const DirectCommsModule: React.FC = () => {
  return (
    <div className="w-full animate-in fade-in duration-300">
      <KelegramApp isCompactMode={false} />
    </div>
  );
};

export default DirectCommsModule;
