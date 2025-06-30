import React, { useState } from 'react';
import Card from './Card';
import { FaSearch, FaDownload } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface ScrapeFollowersProps {
  log: (message: string) => void;
}

const ScrapeFollowers: React.FC<ScrapeFollowersProps> = ({ log }) => {
  const [targetAccount, setTargetAccount] = useState('');
  const [maxFollowers, setMaxFollowers] = useState('10');
  const [followers, setFollowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFollowers([]);
    log(`Scraping followers for ${targetAccount}...`);
    try {
      const response = await fetch('/api/scrape-followers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetAccount, maxFollowers: Number(maxFollowers) })
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.followers)) {
        setFollowers(data.followers);
        log(`Found ${data.followers.length} followers.`);
      } else {
        log('No followers found or error.');
      }
    } catch (err) {
      log('Error fetching followers.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([followers.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${targetAccount}_followers.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card title="Scrape Followers">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.input
          type="text"
          placeholder="Target Username"
          value={targetAccount}
          onChange={(e) => setTargetAccount(e.target.value)}
          required
          onFocus={() => setFocus('targetAccount')}
          onBlur={() => setFocus(null)}
          animate={focus === 'targetAccount' ? { boxShadow: '0 0 8px #00f7ff' } : { boxShadow: 'none' }}
          transition={{ duration: 0.2 }}
        />
        <motion.input
          type="number"
          placeholder="Max Followers"
          value={maxFollowers}
          onChange={(e) => setMaxFollowers(e.target.value)}
          required
          onFocus={() => setFocus('maxFollowers')}
          onBlur={() => setFocus(null)}
          animate={focus === 'maxFollowers' ? { boxShadow: '0 0 8px #00f7ff' } : { boxShadow: 'none' }}
          transition={{ duration: 0.2 }}
        />
        <motion.button
          className="ripple-btn"
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.08, boxShadow: '0 0 12px #00f7ff' }}
          whileTap={{ scale: 0.96, backgroundColor: '#00f7ff', color: '#0a0a1a' }}
        >
          {loading ? 'Scraping...' : <><FaSearch /> Scrape Followers</>}
        </motion.button>
      </motion.form>
      {followers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.button
            className="ripple-btn"
            onClick={handleDownload}
            style={{ marginTop: '1rem' }}
            whileHover={{ scale: 1.08, boxShadow: '0 0 12px #00f7ff' }}
            whileTap={{ scale: 0.96, backgroundColor: '#00f7ff', color: '#0a0a1a' }}
          >
            <FaDownload /> Download Followers
          </motion.button>
          <div style={{ marginTop: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
            <ul>
              {followers.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        </motion.div>
      )}
    </Card>
  );
};

export default ScrapeFollowers; 