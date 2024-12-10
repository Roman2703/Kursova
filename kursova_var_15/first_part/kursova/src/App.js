import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AdjacencyProvider } from './context/AdjacencyContext';
import HomePage from './components/home/HomePage';
import GraphInput from './components/graph/GraphInput';
import GraphTopologicalSort from './components/graph/GraphTopologicalSort';


function App() {
  return (
    <AdjacencyProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/graph" element={
              <div>
                        <h1>Візуалізація топологічного сортування</h1>
                <GraphInput />
                <GraphTopologicalSort />
             
              </div>
            } />
          
          </Routes>
        </div>
      </Router>
    </AdjacencyProvider>
  );
}

export default App;
