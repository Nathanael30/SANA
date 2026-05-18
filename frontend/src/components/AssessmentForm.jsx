import React, { useState, useRef } from 'react';
import { assessRisk, assessImage } from '../api';
import { Mic, MicOff, Image as ImageIcon, Send, AlertTriangle, X, Check } from 'lucide-react';

const AssessmentForm = ({ onAssessmentComplete }) => {
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [imageFlags, setImageFlags] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const [formData, setFormData] = useState({
    patient_name: '',
    age: '',
    gestational_week: '',
    blood_pressure_sys: '',
    blood_pressure_dia: '',
    observation_notes: '',
  });

  const [symptoms, setSymptoms] = useState({
    headache: false,
    'swelling/edema': false,
    'blurred vision': false,
    bleeding: false,
    'abdominal pain': false,
    fever: false,
    'reduced fetal movement': false,
    seizures: false,
  });

  // Voice Recognition Setup
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + ' ';
        }
      }
      if (transcript) {
        setFormData(prev => ({
          ...prev,
          observation_notes: prev.observation_notes + (prev.observation_notes ? ' ' : '') + transcript
        }));
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // Image Upload Logic
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      setImagePreview(base64);
      
      try {
        const response = await assessImage({
          image_type: 'patient observation',
          observed_signs: formData.observation_notes || 'checking for danger signs',
          base64_image: base64
        });
        
        if (response.possible_flags && response.possible_flags.length > 0) {
          setImageFlags(response.possible_flags);
        }
      } catch (err) {
        console.error("Image assessment failed:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleCheckboxChange = (e) => setSymptoms({ ...symptoms, [e.target.name]: e.target.checked });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedSymptoms = Object.keys(symptoms).filter((s) => symptoms[s]);
      // Append image flags as symptoms for the risk assessment
      const finalSymptoms = [...new Set([...selectedSymptoms, ...imageFlags])];
      
      const dataToSubmit = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : 0,
        gestational_week: formData.gestational_week ? parseInt(formData.gestational_week) : 0,
        blood_pressure_sys: formData.blood_pressure_sys ? parseInt(formData.blood_pressure_sys) : null,
        blood_pressure_dia: formData.blood_pressure_dia ? parseInt(formData.blood_pressure_dia) : null,
        symptoms: finalSymptoms,
      };
      
      const result = await assessRisk(dataToSubmit);
      onAssessmentComplete({ ...result, patientData: dataToSubmit });
    } catch (error) {
      console.error("Assessment failed:", error);
      alert(`Assessment failed: ${error.message} \nURL: http://10.0.2.2:8000`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">New Patient Assessment</h2>
        <p className="text-sm text-slate-500">Enter vitals, symptoms, or upload an image for multimodal AI evaluation.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name or ID</label>
            <input type="text" name="patient_name" value={formData.patient_name} onChange={handleInputChange} 
                   className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Maria G." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
            <input type="number" name="age" value={formData.age} onChange={handleInputChange} 
                   className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Years" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gestational Week</label>
            <input type="number" name="gestational_week" value={formData.gestational_week} onChange={handleInputChange} 
                   className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Weeks (e.g. 32)" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-2 border-b pb-1">Blood Pressure</h3>
          <div className="flex items-center space-x-2">
            <input type="number" name="blood_pressure_sys" value={formData.blood_pressure_sys} onChange={handleInputChange} 
                   className="w-24 rounded-lg border-slate-300 border p-2 text-center" placeholder="Sys" />
            <span className="text-slate-400 text-lg">/</span>
            <input type="number" name="blood_pressure_dia" value={formData.blood_pressure_dia} onChange={handleInputChange} 
                   className="w-24 rounded-lg border-slate-300 border p-2 text-center" placeholder="Dia" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-2 border-b pb-1 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1 text-amber-500"/>
            Danger Signs & Symptoms
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(symptoms).map((sym) => (
              <label key={sym} className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <input type="checkbox" name={sym} checked={symptoms[sym]} onChange={handleCheckboxChange}
                       className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-sm text-slate-700 capitalize group-hover:text-slate-900">{sym}</span>
              </label>
            ))}
          </div>
          
          {imageFlags.length > 0 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
              <span className="text-xs font-semibold text-red-600 uppercase">AI Image Findings:</span>
              <ul className="text-sm text-red-800 mt-1">
                {imageFlags.map((flag, idx) => <li key={idx}>• {flag}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-2 border-b pb-1 flex justify-between items-end">
            <span>Observation Notes</span>
            <button type="button" onClick={toggleListening}
                    className={`text-xs flex items-center px-2 py-1 rounded-md transition-colors ${isListening ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
              {isListening ? <><MicOff className="w-3 h-3 mr-1 animate-pulse" /> Stop Listening</> : <><Mic className="w-3 h-3 mr-1" /> Voice Input</>}
            </button>
          </h3>
          <textarea name="observation_notes" value={formData.observation_notes} onChange={handleInputChange} rows="3"
                    className={`w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-colors ${isListening ? 'border-blue-400 bg-blue-50' : 'border-slate-300'}`} 
                    placeholder="Describe what you see or what the patient tells you..." />
        </div>

        {imagePreview && (
          <div className="relative inline-block">
            <img src={imagePreview} alt="Patient Observation" className="h-24 w-24 object-cover rounded-lg border-2 border-blue-200" />
            <button type="button" onClick={() => { setImagePreview(null); setImageFlags([]); }} className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 hover:bg-red-600">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex items-center space-x-4 pt-4 border-t border-slate-100">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
          <button type="button" onClick={() => fileInputRef.current.click()} className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Upload Image">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button type="submit" disabled={loading} 
                  className={`flex-1 flex justify-center items-center py-3 px-4 rounded-xl text-white font-medium shadow-md transition-all ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'}`}>
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center">
                Assess Risk <Send className="w-4 h-4 ml-2" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;
