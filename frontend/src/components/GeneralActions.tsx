import React from 'react';
import Card from './Card';
import { FaSignInAlt, FaMousePointer, FaSignOutAlt } from 'react-icons/fa';

interface GeneralActionsProps {
  apiCall: (endpoint: string, body?: any) => Promise<void>;
}

const GeneralActions: React.FC<GeneralActionsProps> = ({ apiCall }) => {
  return (
    <Card title="General Actions">
      <button onClick={() => apiCall('login')}><FaSignInAlt /> Login</button>
      <button onClick={() => apiCall('interact')}><FaMousePointer /> Interact with Posts</button>
      <button onClick={() => apiCall('exit')}><FaSignOutAlt /> Exit/Logout</button>
    </Card>
  );
};

export default GeneralActions; 