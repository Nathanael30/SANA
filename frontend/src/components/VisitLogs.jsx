import React, { useEffect, useState } from 'react';
import { getVisits } from '../api';
import { Clock, User } from 'lucide-react';

const VisitLogs = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const data = await getVisits();
        setVisits(data.reverse()); // latest first
      } catch (error) {
        console.error("Failed to fetch visits:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, []);

  const getRiskBadge = (level) => {
    const base = "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center ";
    switch (level) {
      case 'EMERGENCY': return base + 'bg-red-100 text-red-800';
      case 'HIGH': return base + 'bg-orange-100 text-orange-800';
      case 'MODERATE': return base + 'bg-yellow-100 text-yellow-800';
      case 'LOW': return base + 'bg-green-100 text-green-800';
      default: return base + 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Loading logs...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Local Visit Logs</h2>
        <p className="text-sm text-slate-500">History of assessments stored on this device.</p>
      </div>
      
      {visits.length === 0 ? (
        <div className="p-8 text-center text-slate-500">No visits logged yet.</div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {visits.map((visit) => (
            <div key={visit.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {visit.patient_name || visit.patient_id || 'Unknown Patient'}
                    </h3>
                    <div className="flex items-center text-xs text-slate-500 space-x-2 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(visit.visit_date).toLocaleString()}</span>
                      <span>•</span>
                      <span>Week {visit.gestational_week || '?'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className={getRiskBadge(visit.risk_level)}>{visit.risk_level}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">{visit.summary}</p>
              {visit.referral_needed && (
                <div className="mt-2 text-xs font-medium text-red-600 bg-red-50 inline-block px-2 py-1 rounded">
                  Referral Generated
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisitLogs;
