// Main application logic
class PathFinderApp {
    constructor() {
        this.graph = createCityMap();
        this.currentPath = null;
        this.svg = document.getElementById('cityMap');
        this.initializeEventListeners();
        this.renderMap();
        this.updateAlgorithmDescription();
    }

    initializeEventListeners() {
        document.getElementById('findPath').addEventListener('click', () => this.findPath());
        document.getElementById('clearPath').addEventListener('click', () => this.clearPath());
        document.getElementById('algorithm').addEventListener('change', () => this.updateAlgorithmDescription());
    }

    renderMap() {
        // Clear existing content
        this.svg.innerHTML = '';

        // Render edges (roads)
        const edges = this.graph.getAllEdges();
        edges.forEach(edge => {
            const fromNode = this.graph.getNode(edge.from);
            const toNode = this.graph.getNode(edge.to);
            
            // Create line element
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', fromNode.x);
            line.setAttribute('y1', fromNode.y);
            line.setAttribute('x2', toNode.x);
            line.setAttribute('y2', toNode.y);
            line.setAttribute('class', 'edge-line');
            line.setAttribute('id', `edge-${edge.from}-${edge.to}`);
            this.svg.appendChild(line);

            // Add weight label
            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', midX - 8);
            rect.setAttribute('y', midY - 8);
            rect.setAttribute('width', 16);
            rect.setAttribute('height', 16);
            rect.setAttribute('fill', 'white');
            rect.setAttribute('stroke', '#ccc');
            rect.setAttribute('rx', 2);
            this.svg.appendChild(rect);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', midX);
            text.setAttribute('y', midY);
            text.setAttribute('class', 'edge-weight');
            text.textContent = edge.weight;
            this.svg.appendChild(text);
        });

        // Render nodes (locations)
        const nodes = this.graph.getAllNodes();
        nodes.forEach(node => {
            // Create circle element
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', 20);
            circle.setAttribute('class', 'node-circle');
            circle.setAttribute('id', `node-${node.id}`);
            this.svg.appendChild(circle);

            // Add node label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y);
            text.setAttribute('class', 'node-text');
            text.textContent = node.id;
            this.svg.appendChild(text);

            // Add location name below the node
            const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            nameText.setAttribute('x', node.x);
            nameText.setAttribute('y', node.y + 35);
            nameText.setAttribute('class', 'edge-weight');
            nameText.setAttribute('text-anchor', 'middle');
            nameText.textContent = node.name;
            this.svg.appendChild(nameText);
        });
    }

    findPath() {
        const start = document.getElementById('startNode').value;
        const end = document.getElementById('endNode').value;
        const algorithm = document.getElementById('algorithm').value;

        if (start === end) {
            this.showResults({
                path: [start],
                cost: 0,
                nodesExplored: 1,
                algorithm: algorithm.toUpperCase()
            });
            return;
        }

        // Clear previous path
        this.clearPath();

        // Find path using selected algorithm
        const result = findPath(this.graph, start, end, algorithm);
        
        if (result) {
            this.currentPath = result;
            this.highlightPath(result.path);
            this.showResults(result);
        } else {
            this.showResults(null);
        }
    }

    clearPath() {
        // Remove path highlighting
        const pathEdges = this.svg.querySelectorAll('.edge-line.path');
        pathEdges.forEach(edge => edge.classList.remove('path'));

        // Remove start/end highlighting
        const startNodes = this.svg.querySelectorAll('.node-circle.start');
        const endNodes = this.svg.querySelectorAll('.node-circle.end');
        startNodes.forEach(node => node.classList.remove('start'));
        endNodes.forEach(node => node.classList.remove('end'));

        this.currentPath = null;
        document.getElementById('pathInfo').innerHTML = '<p>Select start and end locations, choose an algorithm, then click "Find Path"</p>';
    }

    highlightPath(path) {
        if (path.length < 2) return;

        // Highlight start and end nodes
        const startNode = document.getElementById(`node-${path[0]}`);
        const endNode = document.getElementById(`node-${path[path.length - 1]}`);
        startNode.classList.add('start');
        endNode.classList.add('end');

        // Highlight edges in the path
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            
            // Find the edge (could be in either direction)
            let edge = document.getElementById(`edge-${from}-${to}`);
            if (!edge) {
                edge = document.getElementById(`edge-${to}-${from}`);
            }
            
            if (edge) {
                edge.classList.add('path');
            }
        }
    }

    showResults(result) {
        const pathInfo = document.getElementById('pathInfo');
        
        if (!result) {
            pathInfo.innerHTML = '<p style="color: red;">No path found between the selected locations.</p>';
            return;
        }

        const pathString = result.path.join(' → ');
        const locationNames = result.path.map(nodeId => this.graph.getNode(nodeId).name).join(' → ');
        
        pathInfo.innerHTML = `
            <h4>Path Found!</h4>
            <p><strong>Algorithm:</strong> ${result.algorithm}</p>
            <p><strong>Path:</strong> ${pathString}</p>
            <p><strong>Locations:</strong> ${locationNames}</p>
            <p><strong>Total Distance:</strong> ${result.cost} units</p>
            <p><strong>Nodes Explored:</strong> ${result.nodesExplored}</p>
        `;
    }

    updateAlgorithmDescription() {
        const algorithm = document.getElementById('algorithm').value;
        const description = document.getElementById('algorithmDescription');
        
        const descriptions = {
            'bfs': '<p><strong>BFS (Breadth-First Search):</strong> Explores all neighbors at the current depth before moving to nodes at the next depth. Guarantees shortest path in unweighted graphs. Time complexity: O(V + E)</p>',
            'dfs': '<p><strong>DFS (Depth-First Search):</strong> Explores as far as possible along each branch before backtracking. Does not guarantee shortest path but uses less memory. Time complexity: O(V + E)</p>',
            'astar': '<p><strong>A* (A-Star):</strong> Uses heuristics to guide the search towards the goal. Combines the benefits of BFS and greedy search. Guarantees optimal path if heuristic is admissible. Time complexity: O(b^d)</p>'
        };
        
        description.innerHTML = descriptions[algorithm];
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PathFinderApp();
});