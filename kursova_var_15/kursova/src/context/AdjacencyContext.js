import React, { createContext, useState } from 'react';


export const AdjacencyContext = createContext();

export const AdjacencyProvider = ({ children }) => {
  const [vertices, setVertices] = useState([]);
  const [adjacencyList, setAdjacencyList] = useState([]); 


  const clearGraph = () => {
    setVertices([]);
    setAdjacencyList([]);
  };

  return (
    <AdjacencyContext.Provider value={{ vertices, setVertices, adjacencyList, setAdjacencyList, clearGraph }}>
      {children}
    </AdjacencyContext.Provider>
  );
};
