import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/views/DashboardView';
import PlanAView from './components/views/PlanAView';
import PlanBView from './components/views/PlanBView';
import MLPredictionView from './components/views/MLPredictionView';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'plana':
        return <PlanAView />;
      case 'planb':
        return <PlanBView />;
      case 'mlengine':
        return <MLPredictionView />;
      default:
        return <DashboardView />;
    }
  };

  const getTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'System Overview';
      case 'plana': return 'Junction Optimization';
      case 'planb': return 'Pre-Signal Regulation';
      case 'mlengine': return 'Predictive ML Engine';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-900/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[120px]"></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-900/10 blur-[100px]"></div>
      </div>

      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 ml-0 md:ml-64 relative z-10 flex flex-col h-screen overflow-hidden">
        <Header title={getTitle()} />
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
