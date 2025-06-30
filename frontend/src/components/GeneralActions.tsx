import React from 'react';
import Card from './Card';
import { FaSignInAlt, FaMousePointer, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface GeneralActionsProps {
  apiCall: (endpoint: string, body?: any) => Promise<void>;
}

const GeneralActions: React.FC<GeneralActionsProps> = ({ apiCall }) => {
  return (
    <Card title="General Actions">
      <motion.button
        className="ripple-btn"
        whileHover={{ scale: 1.08, boxShadow: '0 0 12px #00f7ff' }}
        whileTap={{ scale: 0.96, backgroundColor: '#00f7ff', color: '#0a0a1a' }}
        onClick={() => apiCall('login')}
      >
        <FaSignInAlt /> Login
      </motion.button>
      <motion.button
        className="ripple-btn"
        whileHover={{ scale: 1.08, boxShadow: '0 0 12px #00f7ff' }}
        whileTap={{ scale: 0.96, backgroundColor: '#00f7ff', color: '#0a0a1a' }}
        onClick={() => apiCall('interact')}
      >
        <FaMousePointer /> Interact with Posts
      </motion.button>
      <motion.button
        className="ripple-btn"
        whileHover={{ scale: 1.08, boxShadow: '0 0 12px #00f7ff' }}
        whileTap={{ scale: 0.96, backgroundColor: '#00f7ff', color: '#0a0a1a' }}
        onClick={() => apiCall('exit')}
      >
        <FaSignOutAlt /> Exit/Logout
      </motion.button>
    </Card>
  );
};

export default GeneralActions; 