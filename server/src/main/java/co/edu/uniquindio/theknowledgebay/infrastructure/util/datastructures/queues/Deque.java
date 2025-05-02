package co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.queues;

import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A generic double-ended queue (deque) that supports operations on both ends.
 *
 * @param <T> the type of elements held in the deque
 */
@Data
@NoArgsConstructor
public class Deque<T> {
    private DoublyLinkedNode<T> front;
    private DoublyLinkedNode<T> rear;
    private int size;

    /**
     * Checks if the deque is empty.
     *
     * @return true if the deque has no elements, false otherwise
     */
    public boolean isEmpty() {
        return front == null;
    }

    /**
     * Inserts an element at the left end (front) of the deque.
     *
     * @param data the element to add
     */
    public void enqueueLeft(T data) {
        DoublyLinkedNode<T> newNode = new DoublyLinkedNode<>(data);
        if (isEmpty()) {
            front = newNode;
            rear = newNode;
        } else {
            newNode.setNext(front);
            front.setPrevious(newNode);
            front = newNode;
        }
        size++;
    }

    /**
     * Inserts an element at the right end (rear) of the deque.
     *
     * @param data the element to add
     */
    public void enqueueRight(T data) {
        DoublyLinkedNode<T> newNode = new DoublyLinkedNode<>(data);
        if (isEmpty()) {
            front = newNode;
            rear = newNode;
        } else {
            rear.setNext(newNode);
            newNode.setPrevious(rear);
            rear = newNode;
        }
        size++;
    }

    /**
     * Removes and returns the element from the left end (front) of the deque.
     *
     * @return the element from the front
     * @throws RuntimeException if the deque is empty
     */
    public T dequeueLeft() {
        if (isEmpty()) {
            throw new RuntimeException("Deque is empty");
        }
        T data = front.getData();
        front = front.getNext();
        if (front != null) {
            front.setPrevious(null);
        } else {
            rear = null;
        }
        size--;
        return data;
    }

    /**
     * Removes and returns the element from the right end (rear) of the deque.
     *
     * @return the element from the rear
     * @throws RuntimeException if the deque is empty
     */
    public T dequeueRight() {
        if (isEmpty()) {
            throw new RuntimeException("Deque is empty");
        }
        T data = rear.getData();
        rear = rear.getPrevious();
        if (rear != null) {
            rear.setNext(null);
        } else {
            front = null;
        }
        size--;
        return data;
    }

    /**
     * Returns the element at the front without removing it.
     *
     * @return the front element
     * @throws RuntimeException if the deque is empty
     */
    public T peekLeft() {
        if (isEmpty()) {
            throw new RuntimeException("Deque is empty");
        }
        return front.getData();
    }

    /**
     * Returns the element at the rear without removing it.
     *
     * @return the rear element
     * @throws RuntimeException if the deque is empty
     */
    public T peekRight() {
        if (isEmpty()) {
            throw new RuntimeException("Deque is empty");
        }
        return rear.getData();
    }

    /**
     * Clears all elements from the deque.
     */
    public void clear() {
        front = null;
        rear = null;
        size = 0;
    }
}