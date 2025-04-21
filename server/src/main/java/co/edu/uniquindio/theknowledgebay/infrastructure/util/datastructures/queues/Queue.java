package co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.queues;

import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.Node;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A generic FIFO (first-in, first-out) queue.
 *
 * @param <T> the type of elements held in the queue
 */
@Data
@NoArgsConstructor
public class Queue<T> {
    private Node<T> front;
    private Node<T> rear;
    private int size;

    /**
     * Checks if the queue is empty.
     *
     * @return true if the queue has no elements, false otherwise
     */
    public boolean isEmpty() {
        return front == null;
    }

    /**
     * Adds an element to the rear of the queue.
     *
     * @param data the element to add
     */
    public void enqueue(T data) {
        Node<T> newNode = new Node<>(data);
        if (isEmpty()) {
            front = newNode;
            rear = newNode;
        } else {
            rear.setNext(newNode);
            rear = newNode;
        }
        size++;
    }

    /**
     * Removes and returns the element at the front of the queue.
     *
     * @return the element at the front of the queue
     * @throws RuntimeException if the queue is empty
     */
    public T dequeue() {
        if (isEmpty()) {
            throw new RuntimeException("Queue is empty");
        }
        T data = front.getData();
        front = front.getNext();
        if (front == null) {  // if the queue becomes empty
            rear = null;
        }
        size--;
        return data;
    }

    /**
     * Returns the element at the front without removing it.
     *
     * @return the element at the front
     * @throws RuntimeException if the queue is empty
     */
    public T peek() {
        if (isEmpty()) {
            throw new RuntimeException("Queue is empty");
        }
        return front.getData();
    }

    /**
     * Clears all elements from the queue.
     */
    public void clear() {
        front = null;
        rear = null;
        size = 0;
    }
}