// Path finding algorithms

// Breadth-First Search (BFS)
function bfs(graph, start, end) {
    const queue = [{ node: start, path: [start], cost: 0 }];
    const visited = new Set();
    let nodesExplored = 0;

    while (queue.length > 0) {
        const { node, path, cost } = queue.shift();
        nodesExplored++;

        if (node === end) {
            return {
                path: path,
                cost: cost,
                nodesExplored: nodesExplored,
                algorithm: 'BFS'
            };
        }

        if (visited.has(node)) continue;
        visited.add(node);

        const neighbors = graph.getNeighbors(node);
        for (const { to, weight } of neighbors) {
            if (!visited.has(to)) {
                queue.push({
                    node: to,
                    path: [...path, to],
                    cost: cost + weight
                });
            }
        }
    }

    return null; // No path found
}

// Depth-First Search (DFS)
function dfs(graph, start, end) {
    const stack = [{ node: start, path: [start], cost: 0 }];
    const visited = new Set();
    let nodesExplored = 0;

    while (stack.length > 0) {
        const { node, path, cost } = stack.pop();
        nodesExplored++;

        if (node === end) {
            return {
                path: path,
                cost: cost,
                nodesExplored: nodesExplored,
                algorithm: 'DFS'
            };
        }

        if (visited.has(node)) continue;
        visited.add(node);

        const neighbors = graph.getNeighbors(node);
        // Reverse order for DFS to maintain consistent exploration
        for (let i = neighbors.length - 1; i >= 0; i--) {
            const { to, weight } = neighbors[i];
            if (!visited.has(to)) {
                stack.push({
                    node: to,
                    path: [...path, to],
                    cost: cost + weight
                });
            }
        }
    }

    return null; // No path found
}

// A* Algorithm
function astar(graph, start, end) {
    const startNode = graph.getNode(start);
    const endNode = graph.getNode(end);
    
    const openSet = [{
        node: start,
        path: [start],
        gCost: 0,
        hCost: window.heuristic(startNode, endNode),
        fCost: window.heuristic(startNode, endNode)
    }];
    
    const closedSet = new Set();
    let nodesExplored = 0;

    while (openSet.length > 0) {
        // Sort by fCost (lowest first)
        openSet.sort((a, b) => a.fCost - b.fCost);
        const current = openSet.shift();
        nodesExplored++;

        if (current.node === end) {
            return {
                path: current.path,
                cost: current.gCost,
                nodesExplored: nodesExplored,
                algorithm: 'A*'
            };
        }

        closedSet.add(current.node);

        const neighbors = graph.getNeighbors(current.node);
        for (const { to, weight } of neighbors) {
            if (closedSet.has(to)) continue;

            const gCost = current.gCost + weight;
            const hCost = window.heuristic(graph.getNode(to), endNode);
            const fCost = gCost + hCost;

            // Check if this path to the neighbor is better
            const existingIndex = openSet.findIndex(item => item.node === to);
            if (existingIndex === -1) {
                openSet.push({
                    node: to,
                    path: [...current.path, to],
                    gCost: gCost,
                    hCost: hCost,
                    fCost: fCost
                });
            } else if (gCost < openSet[existingIndex].gCost) {
                openSet[existingIndex] = {
                    node: to,
                    path: [...current.path, to],
                    gCost: gCost,
                    hCost: hCost,
                    fCost: fCost
                };
            }
        }
    }

    return null; // No path found
}

// Main function to run the selected algorithm
function findPath(graph, start, end, algorithm) {
    switch (algorithm) {
        case 'bfs':
            return bfs(graph, start, end);
        case 'dfs':
            return dfs(graph, start, end);
        case 'astar':
            return astar(graph, start, end);
        default:
            throw new Error('Unknown algorithm: ' + algorithm);
    }
}

// Export functions
window.bfs = bfs;
window.dfs = dfs;
window.astar = astar;
window.findPath = findPath;