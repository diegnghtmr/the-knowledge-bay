package co.edu.uniquindio.theknowledgebay.util.datastructures.stacks;

import co.edu.uniquindio.theknowledgebay.util.datastructures.nodes.Node;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A generic stack implementation (LIFO) using a singly linked list.
 *
 * @param <T> the type of elements in the stack
 */
@Data
@NoArgsConstructor
public class Stack<T> {
    private Node<T> top;
    private int size;

    /**
     * Checks whether the stack is empty.
     *
     * @return true if the stack is empty, otherwise false
     */
    public boolean isEmpty() {
        return top == null;
    }

    /**
     * Pushes an element onto the stack.
     *
     * @param data the element to push onto the stack
     */
    public void push(T data) {
        Node<T> newNode = new Node<>(data);
        newNode.setNext(top);
        top = newNode;
        size++;
    }

    /**
     * Pops the top element from the stack.
     *
     * @return the data from the popped element
     * @throws RuntimeException if the stack is empty
     */
    public T pop() {
        if (isEmpty()) {
            throw new RuntimeException("Stack is empty");
        }
        T data = top.getData();
        top = top.getNext();
        size--;
        return data;
    }

    /**
     * Returns the top element of the stack without removing it.
     *
     * @return the data at the top of the stack
     * @throws RuntimeException if the stack is empty
     */
    public T peek() {
        if (isEmpty()) {
            throw new RuntimeException("Stack is empty");
        }
        return top.getData();
    }

    /**
     * Clears the stack by removing all elements.
     */
    public void clear() {
        top = null;
        size = 0;
    }
}