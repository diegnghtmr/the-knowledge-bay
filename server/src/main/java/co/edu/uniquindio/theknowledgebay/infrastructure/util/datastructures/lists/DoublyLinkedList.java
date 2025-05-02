package co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists;

import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A generic doubly linked list implementation.
 *
 * @param <T> the type of elements stored in the list
 */
@Data
@NoArgsConstructor
public class DoublyLinkedList<T> {
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
        } else {
            newNode.setNext(head);
            head.setPrevious(newNode);
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
        } else {
            tail.setNext(newNode);
            newNode.setPrevious(tail);
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
        while (current != null) {
            if (current.getData().equals(data)) {
                if (current == head && current == tail) {
                    head = null;
                    tail = null;
                } else if (current == head) {
                    head = head.getNext();
                    head.setPrevious(null);
                } else if (current == tail) {
                    tail = tail.getPrevious();
                    tail.setNext(null);
                } else {
                    current.getPrevious().setNext(current.getNext());
                    current.getNext().setPrevious(current.getPrevious());
                }
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
        DoublyLinkedNode<T> current = head;
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
        DoublyLinkedNode<T> current = head;
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
     * Returns a string representation of the list from head to tail.
     *
     * @return a string showing the elements in forward order
     */
    public String displayForward() {
        StringBuilder sb = new StringBuilder();
        DoublyLinkedNode<T> current = head;
        while (current != null) {
            sb.append(current.getData());
            if (current.getNext() != null) {
                sb.append(" <-> ");
            }
            current = current.getNext();
        }
        return sb.toString();
    }

    /**
     * Returns a string representation of the list from tail to head.
     *
     * @return a string showing the elements in reverse order
     */
    public String displayBackward() {
        StringBuilder sb = new StringBuilder();
        DoublyLinkedNode<T> current = tail;
        while (current != null) {
            sb.append(current.getData());
            if (current.getPrevious() != null) {
                sb.append(" <-> ");
            }
            current = current.getPrevious();
        }
        return sb.toString();
    }
}
