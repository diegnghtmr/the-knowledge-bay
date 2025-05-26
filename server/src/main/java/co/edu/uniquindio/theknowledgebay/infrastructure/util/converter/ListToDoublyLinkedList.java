package co.edu.uniquindio.theknowledgebay.infrastructure.util.converter;

import java.util.List;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;

public class ListToDoublyLinkedList {
    /**
     * Converts a List to a DoublyLinkedList.
     *
     * @param <T> the type of elements in the list
     * @param list the List to convert
     * @return a new DoublyLinkedList containing all elements from the input List
     */
    public static <T> DoublyLinkedList<T> convert(List<T> list) {
        DoublyLinkedList<T> doublyLinkedList = new DoublyLinkedList<>();

        if (list != null) {
            for (T element : list) {
                doublyLinkedList.addLast(element);
            }
        }

        return doublyLinkedList;
    }
}