import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
      whileHover={{ scale: 1.025, boxShadow: '0 0 24px 4px #00f7ff, 0 0 60px 0 rgba(0,247,255,0.15)' }}
      whileTap={{ scale: 0.98, boxShadow: '0 0 16px 2px #faff00' }}
    >
      <h2>{title}</h2>
      {children}
    </motion.div>
  );
};

export default Card; 