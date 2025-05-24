package co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.queues;

import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.Node;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A generic priority queue implemented via a sorted singly linked list.
 * Lower values (per natural ordering) have higher priority.
 *
 * @param <T> the type of elements held in this queue, must be Comparable
 */
@Data
@NoArgsConstructor
public class PriorityQueue<T extends Comparable<T>> {
    private Node<T> head;
    private int size;

    /**
     * Checks if the priority queue is empty.
     *
     * @return true if empty, false otherwise.
     */
    public boolean isEmpty() {
        return head == null;
    }

    /**
     * Inserts an element into the priority queue at the correct position.
     *
     * @param data the data to be inserted.
     */
    public void insert(T data) {
        Node<T> newNode = new Node<>(data);
        if (isEmpty() || head.getData().compareTo(data) > 0) {
            // Insert at the beginning if empty or if new node has higher priority.
            newNode.setNext(head);
            head = newNode;
        } else {
            Node<T> current = head;
            while (current.getNext() != null && current.getNext().getData().compareTo(data) <= 0) {
                current = current.getNext();
            }
            newNode.setNext(current.getNext());
            current.setNext(newNode);
        }
        size++;
    }

    /**
     * Removes and returns the element with the highest priority.
     *
     * @return the highest priority element.
     * @throws RuntimeException if the queue is empty.
     */
    public T poll() {
        if (isEmpty()) {
            throw new RuntimeException("PriorityQueue is empty");
        }
        T data = head.getData();
        head = head.getNext();
        size--;
        return data;
    }

    /**
     * Returns the element with the highest priority without removing it.
     *
     * @return the highest priority element.
     * @throws RuntimeException if the queue is empty.
     */
    public T peek() {
        if (isEmpty()) {
            throw new RuntimeException("PriorityQueue is empty");
        }
        return head.getData();
    }

    /**
     * Removes all elements from the priority queue.
     */
    public void clear() {
        head = null;
        size = 0;
    }

    public T dequeue() {
        if (isEmpty()) {
            throw new RuntimeException("PriorityQueue is empty");
        }
        T data = head.getData();
        head = head.getNext();
        size--;
        return data;
    }
}
