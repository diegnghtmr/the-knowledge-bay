package co.edu.uniquindio.theknowledgebay.api.dto;

import java.util.List;

public record UserProfileDTO(
        String name,
        String lastName,
        String username,
        String email,
        String biography,
        String birthdate, // Maybe LocalDate
        List<String> interests
) {}