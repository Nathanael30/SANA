import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AssessmentForm from './components/AssessmentForm';
import RiskResult from './components/RiskResult';
import VisitLogs from './components/VisitLogs';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/logs" element={<VisitLogs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const Home = () => {
  const [assessmentResult, setAssessmentResult] = useState(null);

  return (
    <div className="space-y-6">
      {!assessmentResult ? (
        <AssessmentForm onAssessmentComplete={setAssessmentResult} />
      ) : (
        <RiskResult result={assessmentResult} onReset={() => setAssessmentResult(null)} />
      )}
    </div>
  );
};

export default App;
