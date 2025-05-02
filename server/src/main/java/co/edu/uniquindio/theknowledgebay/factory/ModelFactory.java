package co.edu.uniquindio.theknowledgebay.factory;

import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import lombok.Getter;

@Getter
public class ModelFactory {
    private final TheKnowledgeBay domain = new TheKnowledgeBay();
    private static ModelFactory instance;

    public static ModelFactory getInstance() {
        if (instance == null) {
            instance = new ModelFactory();
            return instance;
        } return instance;
    }
}
