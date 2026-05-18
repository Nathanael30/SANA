import React, { useState } from 'react';
import { saveVisit } from '../api';
import { AlertCircle, CheckCircle, AlertTriangle, FileText, Save, Info } from 'lucide-react';

const RiskResult = ({ result, onReset }) => {
  const [saved, setSaved] = useState(false);

  const getRiskColors = (level) => {
    switch (level) {
      case 'EMERGENCY': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const RiskIcon = ({ level, className }) => {
    if (level === 'EMERGENCY' || level === 'HIGH') return <AlertCircle className={className} />;
    if (level === 'MODERATE') return <AlertTriangle className={className} />;
    return <CheckCircle className={className} />;
  };

  const handleSave = async () => {
    try {
      const visitData = {
        ...result.patientData,
        symptoms: result.patientData.symptoms.join(', '),
        risk_level: result.risk_level,
        summary: result.summary,
        warning_signs: result.warning_signs.join(', '),
        recommended_action: result.recommended_action,
        referral_needed: result.referral_needed,
        referral_letter: result.referral_letter
      };
      await saveVisit(visitData);
      setSaved(true);
    } catch (e) {
      alert("Failed to save visit logs.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Risk Badge Header */}
      <div className={`p-6 border-b flex flex-col items-center justify-center text-center ${getRiskColors(result.risk_level)}`}>
        <RiskIcon level={result.risk_level} className="w-12 h-12 mb-2" />
        <h2 className="text-3xl font-bold tracking-tight mb-1">{result.risk_level} RISK</h2>
        {result.referral_needed && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-800 text-white mt-2">
            Referral Required
          </span>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Clinical Summary</h3>
          <p className="text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-100">{result.summary}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Recommended Action</h3>
          <div className="flex items-start bg-blue-50 p-4 rounded-lg border border-blue-100">
            <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-blue-900 font-medium">{result.recommended_action}</p>
          </div>
        </div>

        {result.warning_signs && result.warning_signs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Identified Warning Signs</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-1">
              {result.warning_signs.map((sign, i) => (
                <li key={i} className="capitalize">{sign}</li>
              ))}
            </ul>
          </div>
        )}

        {result.referral_letter && (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              Referral Letter Generated
            </h3>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs whitespace-pre-wrap font-mono shadow-inner">
              {result.referral_letter}
            </pre>
          </div>
        )}

        <div className="bg-slate-100 text-slate-500 text-xs p-3 rounded-lg border border-slate-200">
          <strong>Disclaimer:</strong> {result.disclaimer}
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 flex space-x-3">
        <button onClick={onReset} 
                className="flex-1 py-2 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors">
          New Assessment
        </button>
        <button onClick={handleSave} disabled={saved}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-white flex items-center justify-center transition-all shadow-sm ${saved ? 'bg-green-600' : 'bg-slate-800 hover:bg-slate-900 hover:shadow'}`}>
          {saved ? <><CheckCircle className="w-4 h-4 mr-2" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> Save Visit</>}
        </button>
      </div>
    </div>
  );
};

export default RiskResult;
