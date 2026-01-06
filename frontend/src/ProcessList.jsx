import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProcessList = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProcesses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/processes', {
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
  }, []);

  const handleKill = async (pid) => {
    try {
      await axios.post(`http://localhost:8000/processes/${pid}/kill`, {}, {
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
      await axios.post(`http://localhost:8000/processes/${pid}/suspend`, {}, {
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
      await axios.post(`http://localhost:8000/processes/${pid}/resume`, {}, {
        headers: { 'X-API-Key': 'supersecretapikey' }
      });
      fetchProcesses();
    } catch (err) {
      console.error(`Error resuming process ${pid}:`, err);
      alert(`Failed to resume process ${pid}: ${err.message}`);
    }
  };

  if (loading) return <div>Loading processes...</div>;
  if (error) return <div>Error loading processes: {error}</div>;

  return (
    <div className="process-list-container">
      <h2>Running Processes</h2>
      <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px', textAlign: 'left' }}>PID</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Memory (%)</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((proc) => (
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
