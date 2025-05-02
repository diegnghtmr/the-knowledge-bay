package co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an edge in the graph's adjacency list.
 *
 * @param <T> the type of data stored in the adjacent vertex.
 */
@Data
@NoArgsConstructor
public class Edge<T> {
    private GraphVertex<T> adjacent;
    private Edge<T> nextEdge;

    public Edge(GraphVertex<T> adjacent) {
        this.adjacent = adjacent;
        this.nextEdge = null;
    }
}