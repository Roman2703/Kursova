import React, { useState, useEffect, useRef, useContext } from 'react';
import { Graph } from 'react-d3-graph';
import { AdjacencyContext } from '../../context/AdjacencyContext';

import "../../styles/GraphVisualizer.css"
import { useNavigate } from 'react-router-dom';

const GraphTopologicalSort = () => {
    const { vertices, adjacencyList } = useContext(AdjacencyContext);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [steps, setSteps] = useState([]);
    const [sortedOrder, setSortedOrder] = useState([]);
    const timeoutRefs = useRef([]);
    const historyRef = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (vertices.length > 0 && adjacencyList.length > 0) {
            initializeGraph();
        }
    }, [vertices, adjacencyList]);

    useEffect(() => {
        if (isRunning && !isPaused) {
            executeStep(stepIndex);
        }
    }, [isRunning, isPaused, stepIndex]);

    const initializeGraph = () => {
        const nodes = vertices.map(vertex => ({
            id: vertex,
            color: "orange",
        }));

        const links = [];
        adjacencyList.forEach((neighbors, fromIndex) => {
            neighbors.forEach((toIndex) => {
                links.push({
                    source: vertices[fromIndex],
                    target: vertices[toIndex],
                    color: "gray",
                    strokeWidth: 2,
                });
            });
        });

        setGraphData({ nodes, links });
        const { steps: topoSteps, order } = getTopologicalSortSteps(adjacencyList, vertices);
        setSteps(topoSteps);
        setSortedOrder(order);
    };

    const clearAllTimeouts = () => {
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current = [];
    };

    const updateNodeColor = (nodeId, color) => {
        setGraphData(prevData => ({
            ...prevData,
            nodes: prevData.nodes.map(node =>
                node.id === nodeId ? { ...node, color } : node
            ),
        }));
    };

    const updateLinkStyle = (source, target, color, width) => {
        setGraphData(prevData => ({
            ...prevData,
            links: prevData.links.map(link =>
                link.source === source && link.target === target
                    ? { ...link, color, strokeWidth: width }
                    : link
            ),
        }));
    };

    const startAlgorithm = () => {
        setIsRunning(true);
        setIsPaused(false);
        setStepIndex(0);
    };

    const pauseAlgorithm = () => {
        setIsPaused(prevPaused => !prevPaused);
        if (!isPaused) {
            clearAllTimeouts();
        } else {
            executeStep(stepIndex);
        }
    };

    const stopAlgorithm = () => {
        setIsRunning(false);
        setIsPaused(false);
        setStepIndex(0);
        clearAllTimeouts();
        if (vertices.length > 0 && adjacencyList.length > 0) {
            initializeGraph();
        }
    };

    const executeStep = (index) => {
        if (index >= steps.length || !isRunning || isPaused) return;

        const step = steps[index];
        historyRef.current.push({ 
            nodes: JSON.parse(JSON.stringify(graphData.nodes)), 
            links: JSON.parse(JSON.stringify(graphData.links)) 
        });

        if (step.type === 'select') {
            updateNodeColor(step.node, 'blue');
        } else if (step.type === 'removeEdge') {
            updateLinkStyle(step.source, step.target, 'red', 4);
        }

        const timeoutId = setTimeout(() => {
            if (!isPaused) {
                if (step.type === 'removeEdge') {
                    updateLinkStyle(step.source, step.target, 'gray', 2);
                }
                setStepIndex(index + 1);
            }
        }, 1200);

        timeoutRefs.current.push(timeoutId);
    };

    const backStep = () => {
        if (stepIndex > 0) {
            clearAllTimeouts();
            setStepIndex((prevIndex) => {
                const newIndex = prevIndex - 1;
                const previousState = historyRef.current.pop();
                if (previousState) {
                    setGraphData({
                        nodes: previousState.nodes,
                        links: previousState.links,
                    });
                }
                return newIndex;
            });
        }
    };

    const getTopologicalSortSteps = (adjList, verts) => {
        const inDegree = Array(verts.length).fill(0);
        adjList.forEach((neighbors, v) => {
            neighbors.forEach(w => {
                inDegree[w]++;
            });
        });

        const steps = [];
        const queue = [];
        inDegree.forEach((deg, i) => {
            if (deg === 0) queue.push(i);
        });

        const order = [];
        while (queue.length > 0) {
            const v = queue.shift();
            steps.push({
                type: 'select', 
                node: verts[v],
                description: `Вибираємо вершину ${verts[v]}, оскільки її вхідна ступінь = 0. (Додаємо її до результату)`
            });
            order.push(verts[v]);

            adjList[v].forEach(w => {
                steps.push({ 
                    type: 'removeEdge', 
                    source: verts[v], 
                    target: verts[w],
                    description: `Видаляємо ребро ${verts[v]} → ${verts[w]}, зменшуємо вхідну ступінь вершини ${verts[w]}.`
                });
                inDegree[w]--;
                if (inDegree[w] === 0) {
                    queue.push(w);
                    steps.push({
                        type: 'info',
                        description: `Вершина ${verts[w]} тепер має вхідну ступінь 0, додаємо її в чергу.`
                    });
                }
            });
        }

        return { steps, order };
    };

    const graphConfig = {
        nodeHighlightBehavior: true,
        directed: true,
        node: { color: "orange", size: 400, fontSize: 16 },
        link: { highlightColor: "gray", strokeWidth: 2 },
        width: 1024, height: 768,
        d3: { alphaTarget: 0.05, gravity: -1000, linkLength: 150, charge: -500 },
    };

    const currentStep = steps[stepIndex];

    if (vertices.length === 0) {
        return <div>Будь ласка, введіть граф, щоб побачити топологічне сортування.</div>;
    }
  
    return (<>
    
        <div className="graph-visualizer">
            
            <div className="graph-container">
                <Graph id="graph-id" data={graphData} config={graphConfig} />
            </div>
            <div className="controls">
                <button onClick={startAlgorithm}>Start</button>
                <button onClick={pauseAlgorithm} disabled={!isRunning}>
                    {isPaused ? "Resume" : "Pause"}
                </button>
                <button onClick={stopAlgorithm} disabled={!isRunning}>Stop</button>
                <button onClick={backStep} disabled={stepIndex === 0 || !isRunning}>Back</button>
                <button onClick={() => navigate('/')}>Home</button>
               
            </div>

            <div className="steps-info">
                <h4>Поточний крок: {stepIndex < steps.length ? (stepIndex + 1) : steps.length} / {steps.length}</h4>
                <p>{currentStep ? currentStep.description : "Натисніть Start для початку."}</p>
            </div>

            <div className="matrix-view">
                <h4>Список суміжності:</h4>
                {vertices.map((v, i) => (
                    <p key={i}>{v}: {adjacencyList[i].map(idx => vertices[idx]).join(", ")}</p>
                ))}
            </div>

            {sortedOrder.length > 0 && (
                <div className="topological-order">
                    <h4>Отриманий топологічний порядок:</h4>
                    {sortedOrder.join(" → ")}
                </div>
            )}

            <div className="all-steps">
                <h4>Усі кроки алгоритму:</h4>
                <ol>
                    {steps.map((s, i) => (
                        <li key={i}>
                            <strong>Крок {i+1} ({s.type}):</strong> {s.description || "Без опису"}
                        </li>
                    ))}
                </ol>
            </div>
        </div>
        </>
    );
};

export default GraphTopologicalSort;
