package co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists;

import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A generic circular doubly linked list implementation.
 *
 * @param <T> the type of elements stored in the list
 */
@Data
@NoArgsConstructor
public class CircularDoublyLinkedList<T> {
    private DoublyLinkedNode<T> head;
    private DoublyLinkedNode<T> tail;
    private int size;

    /**
     * Adds an element at the beginning of the list.
     *
     * @param data the element to add
     */
    public void addFirst(T data) {
        DoublyLinkedNode<T> newNode = new DoublyLinkedNode<>(data);
        if (head == null) {
            head = newNode;
            tail = newNode;
            newNode.setNext(newNode);
            newNode.setPrevious(newNode);
        } else {
            newNode.setNext(head);
            newNode.setPrevious(tail);
            head.setPrevious(newNode);
            tail.setNext(newNode);
            head = newNode;
        }
        size++;
    }

    /**
     * Adds an element at the end of the list.
     *
     * @param data the element to add
     */
    public void addLast(T data) {
        DoublyLinkedNode<T> newNode = new DoublyLinkedNode<>(data);
        if (head == null) {
            head = newNode;
            tail = newNode;
            newNode.setNext(newNode);
            newNode.setPrevious(newNode);
        } else {
            newNode.setNext(head);
            newNode.setPrevious(tail);
            tail.setNext(newNode);
            head.setPrevious(newNode);
            tail = newNode;
        }
        size++;
    }

    /**
     * Removes the first occurrence of the specified element.
     *
     * @param data the element to remove
     */
    public void remove(T data) {
        if (head == null) return;
        DoublyLinkedNode<T> current = head;
        do {
            if (current.getData().equals(data)) {
                if (size == 1) {
                    head = null;
                    tail = null;
                } else if (current == head) {
                    head = head.getNext();
                    tail.setNext(head);
                    head.setPrevious(tail);
                } else if (current == tail) {
                    tail = tail.getPrevious();
                    tail.setNext(head);
                    head.setPrevious(tail);
                } else {
                    current.getPrevious().setNext(current.getNext());
                    current.getNext().setPrevious(current.getPrevious());
                }
                size--;
                return;
            }
            current = current.getNext();
        } while (current != head);
    }

    /**
     * Checks whether the list contains the specified element.
     *
     * @param data the element to search for
     * @return true if found, false otherwise
     */
    public boolean contains(T data) {
        if (head == null) return false;
        DoublyLinkedNode<T> current = head;
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
        DoublyLinkedNode<T> current = head;
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
     * Returns a string representation of the list from head to tail.
     *
     * @return a string showing the elements in forward order
     */
    public String displayForward() {
        if (head == null) return "";
        StringBuilder sb = new StringBuilder();
        DoublyLinkedNode<T> current = head;
        do {
            sb.append(current.getData());
            if (current.getNext() != head) {
                sb.append(" <-> ");
            }
            current = current.getNext();
        } while (current != head);
        return sb.toString();
    }

    /**
     * Returns a string representation of the list from tail to head.
     *
     * @return a string showing the elements in reverse order
     */
    public String displayBackward() {
        if (tail == null) return "";
        StringBuilder sb = new StringBuilder();
        DoublyLinkedNode<T> current = tail;
        do {
            sb.append(current.getData());
            if (current.getPrevious() != tail) {
                sb.append(" <-> ");
            }
            current = current.getPrevious();
        } while (current != tail);
        return sb.toString();
    }
}
