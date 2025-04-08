package co.edu.uniquindio.theknowledgebay.util.datastructures.nodes;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A generic node for a doubly linked list.
 *
 * @param <T> the type of the data stored in the node
 */
@Data
@NoArgsConstructor
public class DoublyLinkedNode<T> {
    private T data;
    private DoublyLinkedNode<T> next;
    private DoublyLinkedNode<T> previous;

    /**
     * Constructs a new DoublyLinkedNode with the specified data.
     *
     * @param data the data to store in the node
     */
    public DoublyLinkedNode(T data) {
        this.data = data;
        this.next = null;
        this.previous = null;
    }
}
