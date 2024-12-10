import React, { useState } from 'react';
import './AvlTreeVisualizer.css';
import { useNavigate } from 'react-router-dom';

class AvlTreeNode {
    constructor(value, x = 400, y = 100) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
        this.x = x;
        this.y = y;
    }
}

class AvlTree {
    constructor() {
        this.root = null;
    }

    height(node) {
        return node ? node.height : 0;
    }

    balanceFactor(node) {
        return node ? this.height(node.left) - this.height(node.right) : 0;
    }

    updateCoordinates(node, x = 400, y = 100, xOffset = 200, yOffset = 80) {
        if (!node) return;
        node.x = x;
        node.y = y;
        this.updateCoordinates(node.left, x - xOffset, y + yOffset, xOffset / 2, yOffset);
        this.updateCoordinates(node.right, x + xOffset, y + yOffset, xOffset / 2, yOffset);
    }

    rotateRight(y) {
        const x = y.left;
        y.left = x.right;
        x.right = y;

        y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
        x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;

        return x;
    }

    rotateLeft(x) {
        const y = x.right;
        x.right = y.left;
        y.left = x;

        x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
        y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;

        return y;
    }

    insert(node, value, x = 400, y = 100, xOffset = 200, yOffset = 80) {
        if (!node) return new AvlTreeNode(value, x, y);

        if (value < node.value) {
            node.left = this.insert(node.left, value, x - xOffset, y + yOffset, xOffset / 2, yOffset);
        } else if (value > node.value) {
            node.right = this.insert(node.right, value, x + xOffset, y + yOffset, xOffset / 2, yOffset);
        } else {
            return node; 
        }

        node.height = Math.max(this.height(node.left), this.height(node.right)) + 1;

        const balance = this.balanceFactor(node);

        if (balance > 1 && value < node.left.value) {
            return this.rotateRight(node);
        }

        if (balance < -1 && value > node.right.value) {
            return this.rotateLeft(node);
        }

        if (balance > 1 && value > node.left.value) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }

        if (balance < -1 && value < node.right.value) {
            node.right = this.rotateRight(node.right);
            return this.rotateLeft(node);
        }

        return node;
    }

    delete(node, value) {
        if (!node) return node;

        if (value < node.value) {
            node.left = this.delete(node.left, value);
        } else if (value > node.value) {
            node.right = this.delete(node.right, value);
        } else {
            if (!node.left || !node.right) {
                node = node.left || node.right;
            } else {
                let temp = this.findMin(node.right);
                node.value = temp.value;
                node.right = this.delete(node.right, temp.value);
            }
        }

        if (!node) return node;

        node.height = Math.max(this.height(node.left), this.height(node.right)) + 1;

        const balance = this.balanceFactor(node);

        if (balance > 1 && this.balanceFactor(node.left) >= 0) {
            return this.rotateRight(node);
        }

        if (balance > 1 && this.balanceFactor(node.left) < 0) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }

        if (balance < -1 && this.balanceFactor(node.right) <= 0) {
            return this.rotateLeft(node);
        }

        if (balance < -1 && this.balanceFactor(node.right) > 0) {
            node.right = this.rotateRight(node.right);
            return this.rotateLeft(node);
        }

        return node;
    }

    findMin(node) {
        while (node.left) node = node.left;
        return node;
    }

    search(node, value) {
        if (!node) return null;
        if (value < node.value) return this.search(node.left, value);
        if (value > node.value) return this.search(node.right, value);
        return node;
    }
}

const AvlTreeVisualizer = () => {
    const [tree] = useState(new AvlTree());
    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [highlightedNode, setHighlightedNode] = useState(null);
    const navigate = useNavigate();

    const updateTreeVisualization = () => {
        tree.updateCoordinates(tree.root);
        const nodeList = [];
        const linkList = [];
        const traverseTree = (node) => {
            if (!node) return;
            nodeList.push({ id: node.value.toString(), x: node.x, y: node.y });
            if (node.left) {
                linkList.push({ source: node.value.toString(), target: node.left.value.toString() });
                traverseTree(node.left);
            }
            if (node.right) {
                linkList.push({ source: node.value.toString(), target: node.right.value.toString() });
                traverseTree(node.right);
            }
        };
        traverseTree(tree.root);
        setNodes(nodeList);
        setLinks(linkList);
    };

    const handleInsert = () => {
        if (inputValue) {
            const value = parseInt(inputValue, 10);
            tree.root = tree.insert(tree.root, value);
            updateTreeVisualization();
            setInputValue('');
        }
    };

    const handleDelete = () => {
        if (inputValue) {
            const value = parseInt(inputValue, 10);
            tree.root = tree.delete(tree.root, value);
            updateTreeVisualization();
            setInputValue('');
        }
    };

    const handleSearch = () => {
        if (searchValue) {
            const value = parseInt(searchValue, 10);
            const foundNode = tree.search(tree.root, value);
   
            setHighlightedNode(foundNode ? foundNode.value.toString() : null);
        }
    };
    
   

    const handleClear = () => {
        tree.root = null;
        setNodes([]);
        setLinks([]);
        setHighlightedNode(null);
    };

    return (
        
       <div className="avl-tree-visualizer">
    <h2>Візуалізація роботи АВЛ дерева</h2>
    <div className="controls">
        <div className="control-group">
            <h3>Insert Node</h3>
            <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value to insert"
            />
            <button onClick={handleInsert}>Insert</button>
        </div>

        <div className="control-group">
            <h3>Delete Node</h3>
            <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value to delete"
            />
            <button onClick={handleDelete}>Delete</button>
        </div>

        <div className="control-group">
            <h3>Search Node</h3>
            <input
                type="number"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter value to search"
            />
            <button onClick={handleSearch}>Search</button>
        </div>

        <div className="control-group">
            <h3>Other Actions</h3>
            <button onClick={handleClear}>Clear Tree</button>
            <button onClick={() => navigate('/')}>Home</button>
        </div>
    </div>

    <svg width="800" height="600" className="tree-container">
        {links.map((link, index) => {
            const source = nodes.find((node) => node.id === link.source);
            const target = nodes.find((node) => node.id === link.target);
            return (
                <line
                    key={index}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="gray"
                    strokeWidth="2"
                />
            );
        })}
        {nodes.map((node) => (
            <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                <circle r="15" fill={node.id === highlightedNode ? 'red' : 'orange'} />
                <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12">
                    {node.id}
                </text>
            </g>
        ))}
    </svg>
</div>

    );
};

export default AvlTreeVisualizer;
