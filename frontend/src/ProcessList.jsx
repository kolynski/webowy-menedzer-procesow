import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:8000`;

// glowny komponent listy
const ProcessList = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'pid', direction: 'ascending' });

  const fetchProcesses = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/processes?_t=${Date.now()}`, {
        headers: { 'X-API-Key': 'supersecretapikey' }
      });
      setProcesses(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching processes:", err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;
    const loop = async () => {
      if (!isMounted) return;
      await fetchProcesses();
      if (isMounted) timeoutId = setTimeout(loop, 2000); // odswiezaj co 2 sekundy
    };
    loop();
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchProcesses]);

  // uzycie useCallback, zeby te funkcje nie zmienialy się przy kazdym renderze
  const handleKill = useCallback(async (pid) => {
    try {
      await axios.post(`${API_BASE_URL}/processes/${pid}/kill`, {}, { headers: { 'X-API-Key': 'supersecretapikey' } });
      // nie wywoluje fetchProcesses natychmiastowo recznie, czekam na loop, zeby nie zatykac UI
    } catch (err) {
      alert(`Failed to kill process ${pid}: ${err.message}`);
    }
  }, []);

  const handleSuspend = useCallback(async (pid) => {
    try {
      await axios.post(`${API_BASE_URL}/processes/${pid}/suspend`, {}, { headers: { 'X-API-Key': 'supersecretapikey' } });
    } catch (err) {
      alert(`Failed to suspend process ${pid}: ${err.message}`);
    }
  }, []);

  const handleResume = useCallback(async (pid) => {
    try {
      await axios.post(`${API_BASE_URL}/processes/${pid}/resume`, {}, { headers: { 'X-API-Key': 'supersecretapikey' } });
    } catch (err) {
      alert(`Failed to resume process ${pid}: ${err.message}`);
    }
  }, []);

  const sortedProcesses = React.useMemo(() => {
    let sortableItems = [...processes];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'name' || sortConfig.key === 'status') {
           aValue = (aValue || '').toString().toLowerCase();
           bValue = (bValue || '').toString().toLowerCase();
        } else {
           aValue = Number(aValue || 0);
           bValue = Number(bValue || 0);
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
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
    if (sortConfig.key === name) return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    return '';
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400 animate-pulse">Loading processes...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-medium">Error loading processes: {error}</div>;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {['pid', 'name', 'status', 'memory_percent'].map((field) => (
                <th key={field} className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group" onClick={() => requestSort(field)}>
                  <div className="flex items-center gap-1">
                    {field === 'memory_percent' ? 'Memory (%)' : field.charAt(0).toUpperCase() + field.slice(1)}
                    <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">{getSortIndicator(field)}</span>
                  </div>
                </th>
              ))}
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedProcesses.map((proc) => (
              <tr key={proc.pid} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 group">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{proc.pid}</td>
                <td className="px-6 py-4 font-medium">{proc.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                    ${proc.status === 'running' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 
                      proc.status === 'sleeping' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'}`}>
                    {proc.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                  {proc.memory_percent ? proc.memory_percent.toFixed(2) : 'N/A'}%
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleKill(proc.pid)} 
                      className="px-3 py-1.5 text-xs font-semibold rounded-md border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-transparent focus:outline-none focus:ring-2 transition-all duration-200 ease-in-out uppercase tracking-wider hover:border-red-500 hover:text-red-500 dark:hover:border-red-500 dark:hover:text-red-400 focus:ring-red-500/50"
                      title="Kill Process"
                    >
                      Kill
                    </button>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
                    <button 
                      onClick={() => handleSuspend(proc.pid)} 
                      className="px-3 py-1.5 text-xs font-semibold rounded-md border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-transparent focus:outline-none focus:ring-2 transition-all duration-200 ease-in-out uppercase tracking-wider hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 focus:ring-blue-500/50"
                      title="Suspend Process"
                    >
                      Suspend
                    </button>
                    <button 
                      onClick={() => handleResume(proc.pid)} 
                      className="px-3 py-1.5 text-xs font-semibold rounded-md border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-transparent focus:outline-none focus:ring-2 transition-all duration-200 ease-in-out uppercase tracking-wider hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 focus:ring-blue-500/50"
                      title="Resume Process"
                    >
                      Resume
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedProcesses.length === 0 && !loading && !error && (
         <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center">
            <span className="text-4xl mb-2">📭</span>
            <p>No processes found.</p>
         </div>
      )}
    </div>
  );
};

export default ProcessList;