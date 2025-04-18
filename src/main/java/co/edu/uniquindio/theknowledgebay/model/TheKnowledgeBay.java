package co.edu.uniquindio.theknowledgebay.model;

import co.edu.uniquindio.theknowledgebay.model.factories.UserFactory;
import co.edu.uniquindio.theknowledgebay.util.datastructures.trees.BinarySearchTree;
import co.edu.uniquindio.theknowledgebay.util.datastructures.graphs.UndirectedGraph;
import co.edu.uniquindio.theknowledgebay.util.datastructures.queues.PriorityQueue;
import co.edu.uniquindio.theknowledgebay.util.datastructures.lists.DoublyLinkedList;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Scope;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
public class TheKnowledgeBay {
    private UserFactory userFactory = UserFactory.getInstance();
    private BinarySearchTree<Content> contentTree;
    private PriorityQueue<HelpRequest> helpRequestQueue;
    private DoublyLinkedList<StudyGroup> studyGroups;
    private DoublyLinkedList<Chat> chats;
    private DoublyLinkedList<Comment> comments;
    private DoublyLinkedList<Message> messages;
    private DoublyLinkedList<Interest> interests;

    public void createContent(Content c) {
        if (contentTree == null) {
            contentTree = new BinarySearchTree<>();
        }
        contentTree.insert(c);
    }

    public void createAutomaticGroups() {
        // TODO: implement functionality
    }

    public DoublyLinkedList<Student> suggestContacts(Student s) {
        // TODO: implement functionality
        return null;
    }

    public DoublyLinkedList<Student> findShortestPath(Student s1, Student s2) {
        // TODO: implement functionality
        return null;
    }

    public void processHelpRequests() {
        // TODO: implement functionality
    }
}