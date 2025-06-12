// Graph data structure and city map definition
class Graph {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
    }

    addNode(id, x, y, name) {
        this.nodes.set(id, { id, x, y, name });
        this.edges.set(id, []);
    }

    addEdge(from, to, weight) {
        this.edges.get(from).push({ to, weight });
        this.edges.get(to).push({ to: from, weight }); // Undirected graph
    }

    getNeighbors(nodeId) {
        return this.edges.get(nodeId) || [];
    }

    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }

    getAllNodes() {
        return Array.from(this.nodes.values());
    }

    getAllEdges() {
        const edges = [];
        const visited = new Set();
        
        for (const [from, neighbors] of this.edges) {
            for (const { to, weight } of neighbors) {
                const edgeKey = [from, to].sort().join('-');
                if (!visited.has(edgeKey)) {
                    edges.push({ from, to, weight });
                    visited.add(edgeKey);
                }
            }
        }
        return edges;
    }
}

// Create the city map
function createCityMap() {
    const graph = new Graph();
    
    // Add nodes (locations) with coordinates and names
    graph.addNode('A', 150, 100, 'Library');
    graph.addNode('B', 300, 150, 'Park');
    graph.addNode('C', 450, 100, 'Mall');
    graph.addNode('D', 200, 250, 'School');
    graph.addNode('E', 400, 250, 'Hospital');
    graph.addNode('F', 600, 200, 'Station');
    graph.addNode('G', 300, 350, 'Museum');
    graph.addNode('H', 550, 400, 'Airport');
    
    // Add edges (roads) with weights (distances)
    graph.addEdge('A', 'B', 5);  // Library to Park
    graph.addEdge('A', 'D', 4);  // Library to School
    graph.addEdge('B', 'C', 3);  // Park to Mall
    graph.addEdge('B', 'D', 2);  // Park to School
    graph.addEdge('B', 'E', 6);  // Park to Hospital
    graph.addEdge('C', 'E', 4);  // Mall to Hospital
    graph.addEdge('C', 'F', 5);  // Mall to Station
    graph.addEdge('D', 'G', 3);  // School to Museum
    graph.addEdge('E', 'F', 7);  // Hospital to Station
    graph.addEdge('E', 'G', 2);  // Hospital to Museum
    graph.addEdge('F', 'H', 4);  // Station to Airport
    graph.addEdge('G', 'H', 5);  // Museum to Airport
    
    return graph;
}

// Heuristic function for A* algorithm (Euclidean distance)
function heuristic(nodeA, nodeB) {
    const dx = nodeA.x - nodeB.x;
    const dy = nodeA.y - nodeB.y;
    return Math.sqrt(dx * dx + dy * dy) / 50; // Scale down for better balance
}

// Export for use in other files
window.Graph = Graph;
window.createCityMap = createCityMap;
window.heuristic = heuristic;