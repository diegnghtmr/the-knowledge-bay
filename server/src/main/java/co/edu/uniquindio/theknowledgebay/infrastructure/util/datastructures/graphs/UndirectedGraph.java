package co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.graphs;

import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.Edge;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.GraphVertex;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A generic undirected graph implementation.
 * The graph maintains a linked list of vertices. Each vertex maintains its own linked list of adjacent edges.
 *
 * @param <T> the type of data stored in the vertices.
 */
@Data
@NoArgsConstructor
public class UndirectedGraph<T> {
    private GraphVertex<T> vertices;  // Head of the linked list of vertices.
    private int vertexCount;

    /**
     * Adds a new vertex to the graph.
     *
     * @param data the data for the new vertex.
     */
    public void addVertex(T data) {
        if (findVertex(data) != null) {
            return; // Vertex already exists.
        }
        GraphVertex<T> newVertex = new GraphVertex<>(data);
        newVertex.setNextVertex(vertices);
        vertices = newVertex;
        vertexCount++;
    }

    private GraphVertex<T> findVertex(T data) {
        GraphVertex<T> current = vertices;
        while (current != null) {
            if (current.getData().equals(data)) {
                return current;
            }
            current = current.getNextVertex();
        }
        return null;
    }

    /**
     * Adds an undirected edge between the vertices containing data1 and data2.
     *
     * @param data1 the data of the first vertex.
     * @param data2 the data of the second vertex.
     * @throws RuntimeException if one or both vertices are not found.
     */
    public void addEdge(T data1, T data2) {
        GraphVertex<T> vertex1 = findVertex(data1);
        GraphVertex<T> vertex2 = findVertex(data2);
        if (vertex1 == null || vertex2 == null) {
            throw new RuntimeException("One or both vertices not found");
        }
        // Add edge from vertex1 to vertex2.
        Edge<T> newEdge1 = new Edge<>(vertex2);
        newEdge1.setNextEdge(vertex1.getEdgeList());
        vertex1.setEdgeList(newEdge1);

        // Since the graph is undirected, add edge from vertex2 to vertex1.
        Edge<T> newEdge2 = new Edge<>(vertex1);
        newEdge2.setNextEdge(vertex2.getEdgeList());
        vertex2.setEdgeList(newEdge2);
    }

    /**
     * Checks if an edge exists between two vertices.
     *
     * @param data1 the data of the first vertex.
     * @param data2 the data of the second vertex.
     * @return true if an edge exists, false otherwise.
     */
    public boolean edgeExists(T data1, T data2) {
        GraphVertex<T> vertex1 = findVertex(data1);
        GraphVertex<T> vertex2 = findVertex(data2);

        if (vertex1 == null || vertex2 == null) {
            return false; // One or both vertices not found, so no edge can exist.
        }

        Edge<T> currentEdge = vertex1.getEdgeList();
        while (currentEdge != null) {
            if (currentEdge.getAdjacent().equals(vertex2)) {
                return true; // Edge found
            }
            currentEdge = currentEdge.getNextEdge();
        }
        return false; // Edge not found
    }

    /**
     * Returns a string representation of the graph.
     *
     * @return a string showing each vertex and its adjacent vertices.
     */
    public String display() {
        StringBuilder sb = new StringBuilder();
        GraphVertex<T> vertex = vertices;
        while (vertex != null) {
            sb.append(vertex.getData()).append(": ");
            Edge<T> edge = vertex.getEdgeList();
            while (edge != null) {
                sb.append(edge.getAdjacent().getData()).append(" ");
                edge = edge.getNextEdge();
            }
            sb.append("\n");
            vertex = vertex.getNextVertex();
        }
        return sb.toString();
    }
}