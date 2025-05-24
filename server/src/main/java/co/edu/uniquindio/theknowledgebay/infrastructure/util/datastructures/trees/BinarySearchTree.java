package co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.trees;

import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.BSTNode;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A generic binary search tree (BST) implementation.
 *
 * @param <T> the type of elements stored in the BST, must be Comparable.
 */
@Data
@NoArgsConstructor
public class BinarySearchTree<T extends Comparable<T>> {
    private BSTNode<T> root;

    /**
     * Inserts a new element into the BST.
     *
     * @param data the data to insert.
     */
    public void insert(T data) {
        root = insertRec(root, data);
    }

    private BSTNode<T> insertRec(BSTNode<T> node, T data) {
        if (node == null) {
            return new BSTNode<>(data);
        }
        int cmp = data.compareTo(node.getData());
        if (cmp < 0) {
            node.setLeft(insertRec(node.getLeft(), data));
        } else if (cmp > 0) {
            node.setRight(insertRec(node.getRight(), data));
        }
        // Duplicates are not inserted; adjust if needed.
        return node;
    }

    /**
     * Checks if the BST contains a specific element.
     *
     * @param data the element to search for.
     * @return true if found, false otherwise.
     */
    public boolean contains(T data) {
        return containsRec(root, data);
    }

    private boolean containsRec(BSTNode<T> node, T data) {
        if (node == null) return false;
        int cmp = data.compareTo(node.getData());
        if (cmp < 0) return containsRec(node.getLeft(), data);
        else if (cmp > 0) return containsRec(node.getRight(), data);
        else return true;
    }

    /**
     * Removes an element from the BST.
     *
     * @param data the element to remove.
     */
    public void remove(T data) {
        root = removeRec(root, data);
    }

    private BSTNode<T> removeRec(BSTNode<T> node, T data) {
        if (node == null) return null;
        int cmp = data.compareTo(node.getData());
        if (cmp < 0) {
            node.setLeft(removeRec(node.getLeft(), data));
        } else if (cmp > 0) {
            node.setRight(removeRec(node.getRight(), data));
        } else {
            // Node to be removed found
            if (node.getLeft() == null) return node.getRight();
            else if (node.getRight() == null) return node.getLeft();
            else {
                // Node with two children: find inorder successor (smallest in the right subtree)
                BSTNode<T> successor = minValueNode(node.getRight());
                node.setData(successor.getData());
                node.setRight(removeRec(node.getRight(), successor.getData()));
            }
        }
        return node;
    }

    private BSTNode<T> minValueNode(BSTNode<T> node) {
        BSTNode<T> current = node;
        while (current.getLeft() != null) {
            current = current.getLeft();
        }
        return current;
    }

    /**
     * Returns an in-order traversal of the tree as a String.
     *
     * @return a string representing the in-order traversal.
     */
    public String inOrder() {
        StringBuilder sb = new StringBuilder();
        inOrderRec(root, sb);
        return sb.toString();
    }

    private void inOrderRec(BSTNode<T> node, StringBuilder sb) {
        if (node != null) {
            inOrderRec(node.getLeft(), sb);
            sb.append(node.getData()).append(" ");
            inOrderRec(node.getRight(), sb);
        }
    }

    /**
     * Checks if the BST is empty.
     *
     * @return true if the tree is empty, false otherwise.
     */
    public boolean isEmpty() {
        return root == null;
    }

    /**
     * Searches for a specific element in the BST and returns it.
     *
     * @param data the element to search for.
     * @return the element if found, null otherwise.
     */
    public T search(T data) {
        return searchRec(root, data);
    }

    private T searchRec(BSTNode<T> node, T data) {
        if (node == null) return null;
        int cmp = data.compareTo(node.getData());
        if (cmp < 0) return searchRec(node.getLeft(), data);
        else if (cmp > 0) return searchRec(node.getRight(), data);
        else return node.getData();
    }

    /**
     * Performs an in-order traversal and adds all elements to the provided list.
     *
     * @param list the list to add elements to.
     */
    public void inOrderTraversal(co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList<T> list) {
        inOrderTraversalRec(root, list);
    }

    private void inOrderTraversalRec(BSTNode<T> node, co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList<T> list) {
        if (node != null) {
            inOrderTraversalRec(node.getLeft(), list);
            list.addLast(node.getData());
            inOrderTraversalRec(node.getRight(), list);
        }
    }
}
