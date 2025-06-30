import React, { useState } from 'react';
import Card from './Card';
import { FaPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface SendDirectMessageProps {
  apiCall: (endpoint: string, body?: any) => Promise<void>;
}

const SendDirectMessage: React.FC<SendDirectMessageProps> = ({ apiCall }) => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [focus, setFocus] = useState<string | null>(null);

  const handleSend = () => {
    if (username && message) {
      apiCall('dm', { username, message });
      setUsername('');
      setMessage('');
    } else {
      alert('Please enter username and message.');
    }
  };

  return (
    <Card title="Send Direct Message">
      <motion.input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onFocus={() => setFocus('username')}
        onBlur={() => setFocus(null)}
        animate={focus === 'username' ? { boxShadow: '0 0 8px #00f7ff' } : { boxShadow: 'none' }}
        transition={{ duration: 0.2 }}
      />
      <motion.input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onFocus={() => setFocus('message')}
        onBlur={() => setFocus(null)}
        animate={focus === 'message' ? { boxShadow: '0 0 8px #00f7ff' } : { boxShadow: 'none' }}
        transition={{ duration: 0.2 }}
      />
      <motion.button
        className="ripple-btn"
        whileHover={{ scale: 1.08, boxShadow: '0 0 12px #00f7ff' }}
        whileTap={{ scale: 0.96, backgroundColor: '#00f7ff', color: '#0a0a1a' }}
        onClick={handleSend}
      >
        <FaPaperPlane /> Send DM
      </motion.button>
    </Card>
  );
};

export default SendDirectMessage; 