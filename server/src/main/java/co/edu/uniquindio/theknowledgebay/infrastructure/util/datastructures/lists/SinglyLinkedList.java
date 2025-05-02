package co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists;

import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.Node;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A generic singly linked list implementation.
 *
 * @param <T> the type of elements stored in the list
 */
@Data
@NoArgsConstructor
public class SinglyLinkedList<T> {
    private Node<T> head;
    private int size;

    /**
     * Adds an element at the beginning of the list.
     *
     * @param data the element to add
     */
    public void addFirst(T data) {
        Node<T> newNode = new Node<>(data);
        newNode.setNext(head);
        head = newNode;
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
        } else {
            Node<T> current = head;
            while (current.getNext() != null) {
                current = current.getNext();
            }
            current.setNext(newNode);
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
        while (current.getNext() != null) {
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
        while (current != null) {
            if (current.getData().equals(reference)) {
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
     * Removes the first occurrence of the specified element.
     *
     * @param data the element to remove
     */
    public void remove(T data) {
        if (head == null) return;
        if (head.getData().equals(data)) {
            head = head.getNext();
            size--;
            return;
        }
        Node<T> current = head;
        while (current.getNext() != null) {
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
        Node<T> current = head;
        while (current != null) {
            if (current.getData().equals(data)) {
                return true;
            }
            current = current.getNext();
        }
        return false;
    }

    /**
     * Returns the index of the first occurrence of the specified element.
     *
     * @param data the element to search for
     * @return the index if found, or -1 otherwise
     */
    public int indexOf(T data) {
        Node<T> current = head;
        int index = 0;
        while (current != null) {
            if (current.getData().equals(data)) {
                return index;
            }
            current = current.getNext();
            index++;
        }
        return -1;
    }

    /**
     * Returns a string representation of the list.
     *
     * @return a string showing all the list elements
     */
    public String display() {
        StringBuilder sb = new StringBuilder();
        Node<T> current = head;
        while (current != null) {
            sb.append(current.getData());
            if (current.getNext() != null) {
                sb.append(" -> ");
            }
            current = current.getNext();
        }
        return sb.toString();
    }
}