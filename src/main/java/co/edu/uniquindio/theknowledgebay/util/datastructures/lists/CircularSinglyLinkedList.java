package co.edu.uniquindio.theknowledgebay.util.datastructures.lists;

import co.edu.uniquindio.theknowledgebay.util.datastructures.nodes.Node;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A generic circular singly linked list implementation.
 *
 * @param <T> the type of elements stored in the list
 */
@Data
@NoArgsConstructor
public class CircularSinglyLinkedList<T> {
    private Node<T> head;
    private int size;

    /**
     * Adds an element at the beginning of the list.
     *
     * @param data the element to add
     */
    public void addFirst(T data) {
        Node<T> newNode = new Node<>(data);
        if (head == null) {
            head = newNode;
            newNode.setNext(newNode);
        } else {
            Node<T> current = head;
            while (current.getNext() != head) {
                current = current.getNext();
            }
            newNode.setNext(head);
            head = newNode;
            current.setNext(head);
        }
        size++;
    }

    /**
     * Adds an element at the end of the list.
     *
     * @param data the element to add
     */
    public void addLast(T data) {
        Node<T> newNode = new Node<>(data);
        if (head == null) {
            head = newNode;
            newNode.setNext(newNode);
        } else {
            Node<T> current = head;
            while (current.getNext() != head) {
                current = current.getNext();
            }
            current.setNext(newNode);
            newNode.setNext(head);
        }
        size++;
    }

    /**
     * Inserts a new element before the first occurrence of the reference element.
     *
     * @param reference the element to locate
     * @param data the element to insert
     */
    public void addBefore(T reference, T data) {
        if (head == null) return;
        if (head.getData().equals(reference)) {
            addFirst(data);
            return;
        }
        Node<T> current = head;
        while (current.getNext() != head) {
            if (current.getNext().getData().equals(reference)) {
                Node<T> newNode = new Node<>(data);
                newNode.setNext(current.getNext());
                current.setNext(newNode);
                size++;
                return;
            }
            current = current.getNext();
        }
    }

    /**
     * Inserts a new element after the first occurrence of the reference element.
     *
     * @param reference the element to locate
     * @param data the element to insert
     */
    public void addAfter(T reference, T data) {
        if (head == null) return;
        Node<T> current = head;
        do {
            if (current.getData().equals(reference)) {
                Node<T> newNode = new Node<>(data);
                newNode.setNext(current.getNext());
                current.setNext(newNode);
                size++;
                return;
            }
            current = current.getNext();
        } while (current != head);
    }

    /**
     * Removes the first occurrence of the specified element.
     *
     * @param data the element to remove
     */
    public void remove(T data) {
        if (head == null) return;
        if (head.getData().equals(data)) {
            if (head.getNext() == head) { // Only one element
                head = null;
            } else {
                Node<T> current = head;
                while (current.getNext() != head) {
                    current = current.getNext();
                }
                head = head.getNext();
                current.setNext(head);
            }
            size--;
            return;
        }
        Node<T> current = head;
        while (current.getNext() != head) {
            if (current.getNext().getData().equals(data)) {
                current.setNext(current.getNext().getNext());
                size--;
                return;
            }
            current = current.getNext();
        }
    }

    /**
     * Checks whether the list contains the specified element.
     *
     * @param data the element to search for
     * @return true if found, false otherwise
     */
    public boolean contains(T data) {
        if (head == null) return false;
        Node<T> current = head;
        do {
            if (current.getData().equals(data)) {
                return true;
            }
            current = current.getNext();
        } while (current != head);
        return false;
    }

    /**
     * Returns the index of the first occurrence of the specified element.
     *
     * @param data the element to search for
     * @return the index if found, or -1 otherwise
     */
    public int indexOf(T data) {
        if (head == null) return -1;
        Node<T> current = head;
        int index = 0;
        do {
            if (current.getData().equals(data)) {
                return index;
            }
            current = current.getNext();
            index++;
        } while (current != head);
        return -1;
    }

    /**
     * Returns a string representation of the list.
     *
     * @return a string showing all the elements in the list
     */
    public String display() {
        if (head == null) return "";
        StringBuilder sb = new StringBuilder();
        Node<T> current = head;
        do {
            sb.append(current.getData());
            current = current.getNext();
            if (current != head) {
                sb.append(" -> ");
            }
        } while (current != head);
        return sb.toString();
    }
}
