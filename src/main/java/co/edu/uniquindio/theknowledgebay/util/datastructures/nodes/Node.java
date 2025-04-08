package co.edu.uniquindio.theknowledgebay.util.datastructures.nodes;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A generic node for a singly linked list.
 *
 * @param <T> the type of the data stored in the node
 */
@Data
@NoArgsConstructor
public class Node<T> {
    private T data;
    private Node<T> next;

    /**
     * Constructs a new Node with the specified data.
     *
     * @param data the data to store in the node
     */
    public Node(T data) {
        this.data = data;
        this.next = null;
    }
}