package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.NoSuchElementException;

class DoublyLinkedListTest {

    private DoublyLinkedList<String> list;

    @BeforeEach
    void setUp() {
        list = new DoublyLinkedList<>();
    }

    @Test
    void testAddFirstAndGetSize() {
        list.addFirst("A");
        assertEquals(1, list.getSize());
        list.addFirst("B");
        assertEquals(2, list.getSize());
    }

    @Test
    void testAddLastAndGetSize() {
        list.addLast("A");
        assertEquals(1, list.getSize());
        list.addLast("B");
        assertEquals(2, list.getSize());
    }

    @Test
    void testRemoveExistingElement() {
        list.addLast("A");
        list.addLast("B");
        list.addLast("C");
        assertTrue(list.remove("B"));
        assertEquals(2, list.getSize());
        assertFalse(list.contains("B"));
    }

    @Test
    void testRemoveNonExistingElement() {
        list.addLast("A");
        assertFalse(list.remove("Z"));
        assertEquals(1, list.getSize());
    }

    @Test
    void testContains() {
        list.addLast("A");
        list.addLast("B");
        assertTrue(list.contains("A"));
        assertTrue(list.contains("B"));
        assertFalse(list.contains("C"));
    }

    @Test
    void testIndexOf() {
        list.addLast("A");
        list.addLast("B");
        list.addLast("A");
        assertEquals(0, list.indexOf("A"));
        assertEquals(1, list.indexOf("B"));
        assertEquals(-1, list.indexOf("C"));
    }

    @Test
    void testGetValidIndex() {
        list.addLast("A");
        list.addLast("B");
        assertEquals("A", list.get(0));
        assertEquals("B", list.get(1));
    }

    @Test
    void testGetInvalidIndex() {
        list.addLast("A");
        assertThrows(IndexOutOfBoundsException.class, () -> list.get(1));
        assertThrows(IndexOutOfBoundsException.class, () -> list.get(-1));
    }

    @Test
    void testRemoveAt() {
        list.addLast("A");
        list.addLast("B");
        list.addLast("C");
        assertEquals("B", list.removeAt(1));
        assertEquals(2, list.getSize());
        assertFalse(list.contains("B"));
        assertEquals("C", list.get(1));
    }

    @Test
    void testIsEmpty() {
        assertTrue(list.isEmpty());
        list.addFirst("A");
        assertFalse(list.isEmpty());
    }

    @Test
    void testIterator() {
        list.addLast("A");
        list.addLast("B");
        var iterator = list.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("A", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("B", iterator.next());
        assertFalse(iterator.hasNext());
        assertThrows(NoSuchElementException.class, iterator::next);
    }
}
