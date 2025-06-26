import React, { useState } from 'react';
import Card from './Card';
import { FaPaperPlane } from 'react-icons/fa';

interface SendDirectMessageProps {
  apiCall: (endpoint: string, body?: any) => Promise<void>;
}

const SendDirectMessage: React.FC<SendDirectMessageProps> = ({ apiCall }) => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

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
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSend}><FaPaperPlane /> Send DM</button>
    </Card>
  );
};

export default SendDirectMessage; 