package co.edu.uniquindio.theknowledgebay.util.datastructures.nodes;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a vertex in the undirected graph.
 * It stores the vertex data, a pointer to the first edge (adjacency list),
 * and a pointer to the next vertex in the graph's vertex list.
 *
 * @param <T> the type of data stored in the vertex.
 */
@Data
@NoArgsConstructor
public class GraphVertex<T> {
    private T data;
    private GraphVertex<T> nextVertex;
    private Edge<T> edgeList;

    public GraphVertex(T data) {
        this.data = data;
        this.nextVertex = null;
        this.edgeList = null;
    }
}
