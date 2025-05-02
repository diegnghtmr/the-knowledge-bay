package co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A node in the binary search tree.
 *
 * @param <T> the type of data stored, must be Comparable.
 */
@Data
@NoArgsConstructor
public class BSTNode<T extends Comparable<T>> {
    private T data;
    private BSTNode<T> left;
    private BSTNode<T> right;

    public BSTNode(T data) {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}