import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:8000`;

const ProcessList = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'pid', direction: 'ascending' });

  const fetchProcesses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/processes`, {
        headers: {
          'X-API-Key': 'supersecretapikey'
        }
      });
      setProcesses(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching processes:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(() => {
      fetchProcesses();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleKill = async (pid) => {
    try {
      await axios.post(`${API_BASE_URL}/processes/${pid}/kill`, {}, {
        headers: { 'X-API-Key': 'supersecretapikey' }
      });
      fetchProcesses();
    } catch (err) {
      console.error(`Error killing process ${pid}:`, err);
      alert(`Failed to kill process ${pid}: ${err.message}`);
    }
  };

  const handleSuspend = async (pid) => {
    try {
      await axios.post(`${API_BASE_URL}/processes/${pid}/suspend`, {}, {
        headers: { 'X-API-Key': 'supersecretapikey' }
      });
      fetchProcesses();
    } catch (err) {
      console.error(`Error suspending process ${pid}:`, err);
      alert(`Failed to suspend process ${pid}: ${err.message}`);
    }
  };

  const handleResume = async (pid) => {
    try {
      await axios.post(`${API_BASE_URL}/processes/${pid}/resume`, {}, {
        headers: { 'X-API-Key': 'supersecretapikey' }
      });
      fetchProcesses();
    } catch (err) {
      console.error(`Error resuming process ${pid}:`, err);
      alert(`Failed to resume process ${pid}: ${err.message}`);
    }
  };

  const sortedProcesses = React.useMemo(() => {
    let sortableItems = [...processes];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle string sorting for Name and Status
        if (sortConfig.key === 'name' || sortConfig.key === 'status') {
           aValue = (aValue || '').toString().toLowerCase();
           bValue = (bValue || '').toString().toLowerCase();
        } else {
           // Handle numeric sorting for PID and Memory
           aValue = Number(aValue || 0);
           bValue = Number(bValue || 0);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [processes, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (name) => {
    if (sortConfig.key === name) {
      return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    }
    return '';
  };

  if (loading) return <div>Loading processes...</div>;
  if (error) return <div>Error loading processes: {error}</div>;

  return (
    <div className="process-list-container">
      <h2>Running Processes</h2>
      <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => requestSort('pid')}>
              PID{getSortIndicator('pid')}
            </th>
            <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => requestSort('name')}>
              Name{getSortIndicator('name')}
            </th>
            <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => requestSort('status')}>
              Status{getSortIndicator('status')}
            </th>
            <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => requestSort('memory_percent')}>
              Memory (%){getSortIndicator('memory_percent')}
            </th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedProcesses.map((proc) => (
            <tr key={proc.pid}>
              <td style={{ padding: '8px' }}>{proc.pid}</td>
              <td style={{ padding: '8px' }}>{proc.name}</td>
              <td style={{ padding: '8px' }}>{proc.status}</td>
              <td style={{ padding: '8px' }}>
                {proc.memory_percent ? proc.memory_percent.toFixed(2) : 'N/A'}
              </td>
              <td style={{ padding: '8px' }}>
                <button onClick={() => handleKill(proc.pid)} style={{ marginRight: '5px' }}>Kill</button>
                <button onClick={() => handleSuspend(proc.pid)} style={{ marginRight: '5px' }}>Suspend</button>
                <button onClick={() => handleResume(proc.pid)}>Resume</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProcessList;
