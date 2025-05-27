package co.edu.uniquindio.theknowledgebay;


import co.edu.uniquindio.theknowledgebay.infrastructure.util.converter.DoublyLinkedListToList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class DoublyLinkedListToListConverterTest {

    @Test
    void testConvertEmptyDoublyLinkedList() {
        DoublyLinkedList<String> doublyLinkedList = new DoublyLinkedList<>();
        List<String> list = DoublyLinkedListToList.convert(doublyLinkedList);
        assertNotNull(list);
        assertTrue(list.isEmpty());
        assertTrue(list instanceof ArrayList);
    }

    @Test
    void testConvertNonEmptyDoublyLinkedList() {
        DoublyLinkedList<Integer> doublyLinkedList = new DoublyLinkedList<>();
        doublyLinkedList.addLast(1);
        doublyLinkedList.addLast(2);
        doublyLinkedList.addLast(3);

        List<Integer> list = DoublyLinkedListToList.convert(doublyLinkedList);
        assertNotNull(list);
        assertEquals(3, list.size());
        assertEquals(1, list.get(0));
        assertEquals(2, list.get(1));
        assertEquals(3, list.get(2));
        assertTrue(list instanceof ArrayList);
    }

    @Test
    void testConvertNullDoublyLinkedList() {
        List<String> list = DoublyLinkedListToList.convert(null);
        assertNotNull(list);
        assertTrue(list.isEmpty());
    }

    @Test
    void testConvertWithSpecificListFactory_ArrayList() {
        DoublyLinkedList<String> doublyLinkedList = new DoublyLinkedList<>();
        doublyLinkedList.addLast("hello");
        doublyLinkedList.addLast("world");

        List<String> list = DoublyLinkedListToList.convert(doublyLinkedList, ArrayList::new);
        assertNotNull(list);
        assertTrue(list instanceof ArrayList);
        assertEquals(2, list.size());
        assertEquals("hello", list.get(0));
    }

    @Test
    void testConvertWithSpecificListFactory_LinkedList() {
        DoublyLinkedList<Double> doublyLinkedList = new DoublyLinkedList<>();
        doublyLinkedList.addLast(1.1);
        doublyLinkedList.addLast(2.2);

        List<Double> list = DoublyLinkedListToList.convert(doublyLinkedList, LinkedList::new);
        assertNotNull(list);
        assertTrue(list instanceof LinkedList);
        assertEquals(2, list.size());
        assertEquals(1.1, list.get(0));
    }
}
