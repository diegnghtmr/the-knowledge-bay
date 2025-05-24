package co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists;

import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Iterator;
import java.util.NoSuchElementException;

/**
 * A generic doubly linked list implementation.
 *
 * @param <T> the type of elements stored in the list
 */
@Data
@NoArgsConstructor
public class DoublyLinkedList<T> implements Iterable<T>{
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
     * Returns the element at the specified index.
     *
     * @param index the index of the element to return
     * @return the element at the specified index
     * @throws IndexOutOfBoundsException if the index is out of range
     */
    public T get(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
        }

        DoublyLinkedNode<T> current = head;
        for (int i = 0; i < index; i++) {
            current = current.getNext();
        }

        return current.getData();
    }

    /**
     * Removes the element at the specified index.
     *
     * @param index the index of the element to remove
     * @return the removed element
     * @throws IndexOutOfBoundsException if the index is out of range
     */
    public T removeAt(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
        }

        // Special case: single element list
        if (size == 1) {
            T data = head.getData();
            head = null;
            tail = null;
            size = 0;
            return data;
        }

        // Special case: remove head
        if (index == 0) {
            T data = head.getData();
            head = head.getNext();
            if (head != null) {
                head.setPrevious(null);
            } else {
                tail = null;
            }
            size--;
            return data;
        }

        // Special case: remove tail
        if (index == size - 1) {
            T data = tail.getData();
            tail = tail.getPrevious();
            tail.setNext(null);
            size--;
            return data;
        }

        // General case: middle element
        DoublyLinkedNode<T> current = head;
        for (int i = 0; i < index; i++) {
            current = current.getNext();
        }

        T data = current.getData();
        current.getPrevious().setNext(current.getNext());
        current.getNext().setPrevious(current.getPrevious());
        size--;

        return data;
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

    /**
     * Checks if the list is empty.
     *
     * @return true if the list contains no elements
     */
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * Returns the number of elements in the list.
     *
     * @return the size of the list
     */
    public int getSize() {
        return size;
    }

    /**
     * Returns an iterator over the elements in this list.
     *
     * @return an iterator
     */
    @Override
    public Iterator<T> iterator() {
        return new DoublyLinkedListIterator();
    }

    /**
     * Iterator implementation for DoublyLinkedList.
     */
    private class DoublyLinkedListIterator implements Iterator<T> {
        private DoublyLinkedNode<T> current = head;

        @Override
        public boolean hasNext() {
            return current != null;
        }

        @Override
        public T next() {
            if (!hasNext()) {
                throw new NoSuchElementException();
            }
            T data = current.getData();
            current = current.getNext();
            return data;
        }
    }
}
