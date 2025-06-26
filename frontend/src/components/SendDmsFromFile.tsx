import React, { useState } from 'react';
import Card from './Card';
import { FaFileExport } from 'react-icons/fa';

interface SendDmsFromFileProps {
  apiCall: (endpoint: string, body?: any) => Promise<void>;
}

const SendDmsFromFile: React.FC<SendDmsFromFileProps> = ({ apiCall }) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      setFileContent('');
    }
  };

  const handleSend = () => {
    if (fileContent && message) {
      apiCall('dm-file', { file: fileContent, message });
      setFileContent('');
      setMessage('');
    } else {
      alert('Please select a file and enter a message.');
    }
  };

  return (
    <Card title="Send DMs from File">
      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
      />
      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSend}><FaFileExport /> Send DMs from File</button>
    </Card>
  );
};

export default SendDmsFromFile; 