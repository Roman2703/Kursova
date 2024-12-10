import React, { useState, useContext } from 'react'; 
import { AdjacencyContext } from '../../context/AdjacencyContext';

import "../../styles/GraphInput.css"

const GraphInput = () => {
  const { setVertices, setAdjacencyList } = useContext(AdjacencyContext);
  const [vertexCount, setVertexCount] = useState('');
  const [edgesInput, setEdgesInput] = useState('');
  const [tempVertices, setTempVertices] = useState([]);

  const handleVertexCountChange = (e) => {
    setVertexCount(e.target.value);
  };

  const handleGenerateVertices = () => {
    const count = parseInt(vertexCount, 10);
    if (!isNaN(count) && count > 0 && count <= 15) {
      const verts = Array.from({ length: count }, (_, i) => `V${i + 1}`);
      setTempVertices(verts);
    } else if (count > 15) {
      alert("Кількість вершин не може перевищувати 15.");
    } else {
      alert("Введіть коректне число вершин > 0.");
    }
  };

  const handleClearGraph = () => {
    setVertices([]);
    setAdjacencyList([]);
    setTempVertices([]);
    setVertexCount('');
    setEdgesInput('');
  };

  const handleSubmitAdjacency = () => {
    const lines = edgesInput.split('\n').map(l => l.trim()).filter(l => l);
    const verts = [...tempVertices];
    const adjList = verts.map(() => []);

    lines.forEach(line => {
      const [v, neighStr] = line.split(':').map(s => s.trim());
      const vIndex = verts.indexOf(v);
      if (vIndex >= 0) {
        if (neighStr) {
          const neighs = neighStr.split(',').map(n => n.trim());
          neighs.forEach(nv => {
            const wIndex = verts.indexOf(nv);
            if (wIndex >= 0) {
              adjList[vIndex].push(wIndex);
            }
          });
        }
      }
    });

    setVertices(verts);
    setAdjacencyList(adjList);
  };

  return (
    <div className="graph-input-container">
      <h3>Введення графа</h3>
      <div>
        <label>Кількість вершин: </label>
        <input 
          type="number" 
          value={vertexCount} 
          onChange={handleVertexCountChange} 
        />
        <button onClick={handleGenerateVertices}>Створити вершини</button>
      </div>

      {tempVertices.length > 0 && (
        <div>
          <p className="vertices-list">Ваші вершини: {tempVertices.join(', ')}</p>
          <p>Введіть список суміжності у форматі:</p>
          <pre>
{`V1: V2,V3
V2: V3
V3:`}
          </pre>
          <textarea 
            rows="5" 
            value={edgesInput}
            onChange={(e) => setEdgesInput(e.target.value)}
            placeholder="Введіть список суміжності..."
          ></textarea><br/>
          <button onClick={handleSubmitAdjacency}>Підтвердити граф</button>
          <button onClick={handleClearGraph} style={{ marginLeft: '10px' }}>Очистити граф</button>
        </div>
      )}
    </div>
  );
};

export default GraphInput;
