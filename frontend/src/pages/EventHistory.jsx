import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Download, 
  Trash2, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Plus,
  Filter,
  FileSpreadsheet
} from 'lucide-react';

export default function EventHistory({ events, onClearEvents, onAddMockEvent, showToast }) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesFilter = filterType === 'ALL' || ev.type.toUpperCase() === filterType;
      const matchesSearch = 
        ev.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.auditor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [events, filterType, searchQuery]);

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Type', 'Source', 'Detail', 'Tag', 'Auditor'];
    const rows = filteredEvents.map((e) => [
      e.id,
      `"${e.time}"`,
      `"${e.type}"`,
      `"${e.source}"`,
      `"${e.detail.replace(/"/g, '""')}"`,
      `"${e.tag}"`,
      `"${e.auditor}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `safecity-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported audit log CSV successfully.');
  };

  return (
    <div className="flex flex-col gap-4 animate-tab-fade">
      {/* Control Bar */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Filter by keyword, vehicle, junction, or detector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-md pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onAddMockEvent();
                showToast('Injected simulated corridor audit log entry.');
              }}
              className="btn btn-secondary text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Incident</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="btn btn-primary text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => {
                onClearEvents();
                showToast('Cleared active audit event stream.');
              }}
              className="btn btn-secondary text-xs text-danger hover:border-danger hover:bg-danger-surface"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-border">
          <span className="text-[11px] font-bold text-text-muted mr-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>
          {['ALL', 'PREEMPTION', 'DETECTION', 'ROUTING', 'ARRIVAL', 'DISPATCH'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                filterType === type 
                  ? 'bg-accent text-white shadow-sm' 
                  : 'bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border'
              }`}
            >
              {type === 'ALL' ? 'All Events' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
          <span className="ml-auto text-xs font-semibold text-text-muted tabular-nums">
            Showing {filteredEvents.length} of {events.length} records
          </span>
        </div>
      </div>

      {/* Audit Log Table Card */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-elevated border-b border-border text-[10px] font-extrabold uppercase text-text-muted tracking-wider">
                <th className="py-2.5 px-3">Time (PKT)</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Source Unit</th>
                <th className="py-2.5 px-3">Operational Log Detail</th>
                <th className="py-2.5 px-3">Auditor Origin</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted text-xs">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-text-secondary tabular-nums whitespace-nowrap">
                      {ev.time}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        ev.type === 'Preemption' ? 'bg-success-surface text-success border border-success-border' :
                        ev.type === 'Detection' ? 'bg-accent-surface text-accent border border-accent/20' :
                        ev.type === 'Routing' ? 'bg-primary-surface text-primary border border-primary/20' :
                        'bg-surface-elevated text-text-primary border border-border'
                      }`}>
                        {ev.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-text-primary whitespace-nowrap">
                      {ev.source}
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary max-w-md">
                      {ev.detail}
                    </td>
                    <td className="py-2.5 px-3 text-text-muted whitespace-nowrap">
                      {ev.auditor}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className="badge badge-success">
                        {ev.tag}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
