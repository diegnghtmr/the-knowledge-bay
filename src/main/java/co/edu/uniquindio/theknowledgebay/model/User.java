package co.edu.uniquindio.theknowledgebay.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@SuperBuilder
public abstract class User {
    
    private Integer id;
    
    private String name;
    private String email;
    private String password;
    
    public abstract boolean login();
    
    public abstract void logout();
}

