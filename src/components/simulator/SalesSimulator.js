import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SimulatorHome from './SimulatorHome';
import SimulatorBrief from './SimulatorBrief';
import SimulatorChat from './SimulatorChat';
import ChatExport from './ChatExport';
import './SalesSimulator.css';

/**
 * SalesSimulator Component
 * 
 * This component serves as the container for all simulator-related routes.
 * It handles the nested routing for the simulator experience.
 */
const SalesSimulator = () => {
  return (
    <div className="sales-simulator">
      <Routes>
        <Route index element={<SimulatorHome />} />
        <Route path="brief" element={<SimulatorBrief />} />
        <Route path="chat" element={<SimulatorChat />} />
        <Route path="export" element={<ChatExport />} />
        <Route path="*" element={<Navigate to="/simulator" replace />} />
      </Routes>
    </div>
  );
};

export default SalesSimulator; 