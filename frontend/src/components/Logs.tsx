import React, { useState, useRef } from 'react';
// import Card from './Card';
import { FaTerminal, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface LogsProps {
  logs: string[];
}

const Logs: React.FC<LogsProps> = ({ logs }) => {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const previewLogs = logs.slice(-2);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.body.style.userSelect = 'none';
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };
  const onMouseUp = () => {
    setDragging(false);
    document.body.style.userSelect = '';
  };

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    setDragging(true);
    const touch = e.touches[0];
    dragOffset.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
  };
  const onTouchMove = (e: TouchEvent) => {
    if (!dragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragOffset.current.x,
      y: touch.clientY - dragOffset.current.y,
    });
  };
  const onTouchEnd = () => {
    setDragging(false);
  };

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
    // eslint-disable-next-line
  }, [dragging]);

  // Keep window within viewport
  React.useEffect(() => {
    if (!containerRef.current) return;
    const { innerWidth, innerHeight } = window;
    const rect = containerRef.current.getBoundingClientRect();
    let x = position.x;
    let y = position.y;
    if (rect.right > innerWidth) x = innerWidth - rect.width;
    if (rect.left < 0) x = 0;
    if (rect.bottom > innerHeight) y = innerHeight - rect.height;
    if (rect.top < 0) y = 0;
    if (x !== position.x || y !== position.y) setPosition({ x, y });
    // eslint-disable-next-line
  }, [position.x, position.y]);

  // Adjust position on window resize to stay in bounds
  React.useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { innerWidth, innerHeight } = window;
      const rect = containerRef.current.getBoundingClientRect();
      let x = position.x;
      let y = position.y;
      if (rect.right > innerWidth) x = innerWidth - rect.width;
      if (rect.left < 0) x = 0;
      if (rect.bottom > innerHeight) y = innerHeight - rect.height;
      if (rect.top < 0) y = 0;
      if (x !== position.x || y !== position.y) setPosition({ x, y });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, containerRef]);

  return (
    <div
      ref={containerRef}
      className={`logs-floating-container${open ? ' open' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none',
      }}
    >
      <motion.div
        className="logs-card-wrapper"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      >
        <div
          className="logs-header"
        >
          <span className="logs-title"><FaTerminal /> Logs</span>
          <button className="logs-toggle-btn" onClick={() => setOpen(o => !o)}>
            {open ? <FaChevronDown /> : <FaChevronUp />}
          </button>
        </div>
        <AnimatePresence>
          {open ? (
            <motion.div
              key="logs-full"
              className="logs-content logs-full"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '300px', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div id="logs">
                {logs.length === 0 ? (
                  <div className="logs-empty">No logs yet.</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="logs-preview"
              className="logs-content logs-preview"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '48px', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div id="logs">
                {previewLogs.length === 0 ? (
                  <div className="logs-empty">No logs yet.</div>
                ) : (
                  previewLogs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Logs; 