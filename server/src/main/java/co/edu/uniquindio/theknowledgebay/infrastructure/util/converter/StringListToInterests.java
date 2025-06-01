package co.edu.uniquindio.theknowledgebay.infrastructure.util.converter;

import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import java.util.List;

import java.util.ArrayList;
import java.util.List;

public class StringListToInterests {

    public static DoublyLinkedList<Interest> convert(List<String> list) {

        if (list == null) {
            return new DoublyLinkedList<>();
        }

        DoublyLinkedList<Interest> interests = new DoublyLinkedList<>();
        for (String s : list) {
            if (s != null && !s.trim().isEmpty()) {
                Interest interest = new Interest();
                interest.setName(s.trim());
                interests.addLast(interest);
            }
        }

        return interests;
    }

}
