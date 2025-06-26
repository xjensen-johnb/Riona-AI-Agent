import React, { useState } from 'react';
import Card from './Card';
import { FaSearch, FaDownload } from 'react-icons/fa';

interface ScrapeFollowersProps {
  log: (message: string) => void;
}

const ScrapeFollowers: React.FC<ScrapeFollowersProps> = ({ log }) => {
  const [targetAccount, setTargetAccount] = useState('');
  const [maxFollowers, setMaxFollowers] = useState('10');
  const [followers, setFollowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Target Username"
          value={targetAccount}
          onChange={(e) => setTargetAccount(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Max Followers"
          value={maxFollowers}
          onChange={(e) => setMaxFollowers(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Scraping...' : <><FaSearch /> Scrape Followers</>}
        </button>
      </form>
      {followers.length > 0 && (
        <div>
          <button onClick={handleDownload} style={{ marginTop: '1rem' }}>
            <FaDownload /> Download Followers
          </button>
          <div style={{ marginTop: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
            <ul>
              {followers.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ScrapeFollowers; 