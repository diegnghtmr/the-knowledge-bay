package co.edu.uniquindio.theknowledgebay.infrastructure.util.converter;

import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;

public class StringListToInterests {

    public static DoublyLinkedList<Interest> convert(DoublyLinkedList<String> list) {

        if (list == null) {
            return null;
        }

        DoublyLinkedList<Interest> interests = new DoublyLinkedList<>();
        for (String s : list) {
            Interest interest = new Interest();
            interest.setName(s);
            interests.addFirst(interest);
        }

        return interests;
    }

}
