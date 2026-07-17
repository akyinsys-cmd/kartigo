import React, { useState, useEffect } from 'react';
import { Database, Download, RefreshCw, HardDrive, Calendar, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BackupItem {
  id: string;
  filename: string;
  date: string;
  size: string;
  type: string;
  status: string;
}

export default function AdminBackupManager() {
  const { user } = useAuth();
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchBackups = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/v1/admin/backups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to retrieve backups list');
      const data = await res.json();
      setBackups(data.backups || []);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || 'Failed to load backups.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, [user]);

  const handleCreateBackup = async () => {
    if (!user) return;
    setActionLoading('create');
    setMessage(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/v1/admin/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Backup process failed on server.');
      const data = await res.json();
      setMessage({ text: data.message || 'Backup completed successfully!', type: 'success' });
      fetchBackups();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to initiate backup.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to restore the backup from "${filename}"? This will overwrite existing database entities with snapshot values.`)) {
      return;
    }
    setActionLoading(`restore_${filename}`);
    setMessage(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/v1/admin/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename })
      });
      if (!res.ok) throw new Error('Restoration handshake failed.');
      const data = await res.json();
      setMessage({ text: data.message || 'Database successfully restored from snapshot!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Restoration task failed.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadBackup = async (filename: string) => {
    if (!user) return;
    setActionLoading(`download_${filename}`);
    setMessage(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/v1/admin/backups/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('File download failed.');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to download backup snapshot.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  // Calculate total space used
  const totalMB = backups.reduce((acc, curr) => {
    const size = parseFloat(curr.size);
    return isNaN(size) ? acc : acc + size;
  }, 0).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-[#3C1A47]">Backups & Recovery</h2>
          <p className="text-xs text-[#8395A7] mt-1">Manage database snapshots, automated backups, and disaster recovery.</p>
        </div>
        <button 
          onClick={handleCreateBackup}
          disabled={actionLoading !== null}
          className="flex items-center gap-2 bg-[#2B9348] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#237a3b] transition-colors shadow-md disabled:opacity-50"
        >
          {actionLoading === 'create' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          Create Manual Backup
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          )}
          <div>
            <p className="text-xs font-medium">{message.text}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-[20px] border border-[#E5F5B8] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-[#2B9348]/10 flex items-center justify-center text-[#2B9348]">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="text-[#3C1A47] text-sm font-bold">Automated Backups</span>
          </div>
          <div className="text-xs text-[#8395A7] mb-4">Currently running every 24 hours at 02:00 UTC.</div>
          <button className="text-xs font-bold text-[#2B9348] hover:underline">Configure Schedule</button>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-[#E5F5B8] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-[#3C1A47]/10 flex items-center justify-center text-[#3C1A47]">
              <HardDrive className="h-4 w-4" />
            </div>
            <span className="text-[#3C1A47] text-sm font-bold">Storage Used</span>
          </div>
          <div className="text-2xl font-bold font-display text-[#3C1A47] mb-1">{totalMB} MB</div>
          <div className="text-[10px] text-[#8395A7]">Across {backups.length} retained snapshots</div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-[#E5F5B8] shadow-sm flex flex-col justify-center items-center text-center">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse" />
          </div>
          <span className="text-sm font-bold text-[#3C1A47]">System Healthy</span>
          <span className="text-[10px] text-[#8395A7]">Last backup successful</span>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5F5B8] flex justify-between items-center">
          <h3 className="text-sm font-bold text-[#3C1A47]">Backup History</h3>
          <button 
            onClick={fetchBackups}
            disabled={loading}
            className="text-xs font-bold text-[#3C1A47] hover:text-[#2B9348] flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-xs text-[#8395A7] flex flex-col justify-center items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-[#2B9348]" />
            Reading backups directory...
          </div>
        ) : backups.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8395A7]">
            No backup files found. Create one to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#F1FEC8]/50 text-[10px] uppercase tracking-wider font-mono text-[#8395A7] border-b border-[#E5F5B8]">
                  <th className="p-4 font-bold">Date & Time</th>
                  <th className="p-4 font-bold">Filename</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Size</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5F5B8] text-sm">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-[#F1FEC8]/20 transition-colors">
                    <td className="p-4 text-[#3C1A47] font-mono text-xs">{backup.date}</td>
                    <td className="p-4 text-[#8395A7] font-mono text-xs max-w-xs truncate" title={backup.filename}>{backup.filename}</td>
                    <td className="p-4 text-[#8395A7] text-xs">{backup.type}</td>
                    <td className="p-4 text-[#8395A7] text-xs font-mono">{backup.size}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {backup.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => handleDownloadBackup(backup.filename)}
                        disabled={actionLoading !== null}
                        className="text-[#3C1A47] hover:bg-[#F1FEC8]/50 p-1.5 rounded-lg transition-colors disabled:opacity-50" 
                        title="Download Backup"
                      >
                        {actionLoading === `download_${backup.filename}` ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#3C1A47]" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </button>
                      <button 
                        onClick={() => handleRestoreBackup(backup.filename)}
                        disabled={actionLoading !== null}
                        className="text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg transition-colors disabled:opacity-50" 
                        title="Restore this backup"
                      >
                        {actionLoading === `restore_${backup.filename}` ? (
                          <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
