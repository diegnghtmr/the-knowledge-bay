package co.edu.uniquindio.theknowledgebay.core.model;

import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import lombok.Data;
import lombok.AllArgsConstructor;


import lombok.Builder;

import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chat {
    private int chatId;
    private Student studentA;
    private Student studentB;
    private DoublyLinkedList<Message> messages;

    public void sendMessage(Message m) {
        // TODO: implement functionality
        if (messages != null) {
            messages.addLast(m);
        }
    }

}