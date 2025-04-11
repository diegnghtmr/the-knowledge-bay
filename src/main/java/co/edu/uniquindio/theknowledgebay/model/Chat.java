package co.edu.uniquindio.theknowledgebay.model;

import co.edu.uniquindio.theknowledgebay.util.datastructures.lists.DoublyLinkedList;
import jakarta.persistence.*;
import lombok.Data;
import lombok.AllArgsConstructor;

import lombok.Builder;

import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "chats")
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int chatId;
    @ManyToOne
    @JoinColumn(name = "student_a_id")
    private Student studentA;
    @ManyToOne
    @JoinColumn(name = "student_b_id")
    private Student studentB;
    @Transient
    private DoublyLinkedList<Message> messages;

    public void sendMessage(Message m) {
        // TODO: implement functionality
        if (messages != null) {
            messages.addLast(m);
        }
    }

}