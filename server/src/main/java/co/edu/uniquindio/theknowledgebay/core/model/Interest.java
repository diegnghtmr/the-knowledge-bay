package co.edu.uniquindio.theknowledgebay.core.model;

import lombok.AllArgsConstructor;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interest {
    private String idInterest;
    private String name;
}