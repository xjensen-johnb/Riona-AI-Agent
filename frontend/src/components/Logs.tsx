import React from 'react';
import Card from './Card';
import { FaTerminal } from 'react-icons/fa';

interface LogsProps {
  logs: string[];
}

const Logs: React.FC<LogsProps> = ({ logs }) => {
  return (
    <Card title={<><FaTerminal /> Logs</>}>
      <div id="logs">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </Card>
  );
};

export default Logs; 