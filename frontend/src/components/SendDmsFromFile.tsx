import React, { useState } from 'react';
import Card from './Card';
import { FaFileExport } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface SendDmsFromFileProps {
  apiCall: (endpoint: string, body?: any) => Promise<void>;
}

const SendDmsFromFile: React.FC<SendDmsFromFileProps> = ({ apiCall }) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [message, setMessage] = useState('');
  const [focus, setFocus] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      setFileContent('');
      setFileName('');
    }
  };

  const handleSend = () => {
    if (fileContent && message) {
      apiCall('dm-file', { file: fileContent, message });
      setFileContent('');
      setMessage('');
      setFileName('');
    } else {
      alert('Please select a file and enter a message.');
    }
  };

  return (
    <Card title="Send DMs from File">
      <div className="file-input-wrapper">
        <label className="file-input-label">
          <input
            className="file-input"
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            onFocus={() => setFocus('file')}
            onBlur={() => setFocus(null)}
          />
          <span className="file-input-text">{fileName || 'Choose File'}</span>
        </label>
      </div>
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
        <FaFileExport /> Send DMs from File
      </motion.button>
    </Card>
  );
};

export default SendDmsFromFile; 