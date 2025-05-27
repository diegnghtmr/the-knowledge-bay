package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.InterestDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.repository.InterestRepository;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class InterestService {

    private final TheKnowledgeBay theKnowledgeBay;
    private final InterestRepository interestRepository;

    public InterestService(TheKnowledgeBay theKnowledgeBay, InterestRepository interestRepository) {
        this.theKnowledgeBay = theKnowledgeBay;
        this.interestRepository = interestRepository;
    }

    public List<InterestDTO> getAllInterests() {
        DoublyLinkedList<Interest> interests = theKnowledgeBay.getAllInterests();
        List<InterestDTO> response = new ArrayList<>();

        if (interests != null) {
            for (int i = 0; i < interests.getSize(); i++) {
                Interest interest = interests.get(i);
                response.add(mapToDTO(interest));
            }
        }
        return response;
    }

    public AuthResponseDTO createInterest(String name, String currentUserId) {
        Interest interest = Interest.builder()
                .name(name)
                .build();

        boolean added = theKnowledgeBay.addInterest(interest);

        return added ?
                new AuthResponseDTO(true, "Interés creado exitosamente.") :
                new AuthResponseDTO(false, "Error al crear el interés.");
    }

    public AuthResponseDTO updateInterest(String id, String name, String currentUserId) {
        boolean updated = theKnowledgeBay.updateInterest(id, name);

        return updated ?
                new AuthResponseDTO(true, "Interés actualizado exitosamente.") :
                new AuthResponseDTO(false, "Interés no encontrado.");
    }

    public AuthResponseDTO deleteInterest(String id, String currentUserId) {
        boolean deleted = theKnowledgeBay.deleteInterest(id);

        return deleted ?
                new AuthResponseDTO(true, "Interés eliminado exitosamente.") :
                new AuthResponseDTO(false, "Interés no encontrado.");
    }

    private InterestDTO mapToDTO(Interest interest) {
        return InterestDTO.builder()
                .idInterest(interest.getIdInterest())
                .name(interest.getName())
                .build();
    }

    public boolean isInterestNameTaken(String name) {
        DoublyLinkedList<Interest> interests = interestRepository.findByName(name);

        for (Interest i : interests) {
            if (i.getName().equals(name)) {
                return true;
            }
        }

        return false;
    }

}