package co.edu.uniquindio.theknowledgebay.infrastructure.util.converter;

import java.util.ArrayList;
import java.util.List;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;

public class DoublyLinkedListToList {
    /**
     * Converts a DoublyLinkedList to a List (ArrayList by default).
     *
     * @param <T> the type of elements in the list
     * @param doublyLinkedList the DoublyLinkedList to convert
     * @return a new List containing all elements from the input DoublyLinkedList
     */
    public static <T> List<T> convert(DoublyLinkedList<T> doublyLinkedList) {
        List<T> list = new ArrayList<>();

        if (doublyLinkedList != null) {
            for (T element : doublyLinkedList) {
                list.add(element);
            }
        }

        return list;
    }

    /**
     * Converts a DoublyLinkedList to a specific type of List.
     *
     * @param <T> the type of elements in the list
     * @param <L> the specific List implementation
     * @param doublyLinkedList the DoublyLinkedList to convert
     * @param listFactory a supplier providing the empty List implementation
     * @return a new List of the specified type containing all elements
     */
    public static <T, L extends List<T>> L convert(DoublyLinkedList<T> doublyLinkedList,
                                                   java.util.function.Supplier<L> listFactory) {
        L list = listFactory.get();

        if (doublyLinkedList != null) {
            for (T element : doublyLinkedList) {
                list.add(element);
            }
        }

        return list;
    }
}