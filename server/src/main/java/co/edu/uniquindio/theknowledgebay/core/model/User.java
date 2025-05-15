package co.edu.uniquindio.theknowledgebay.core.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@SuperBuilder
public abstract class User {
    
    private String id;
    private String username;
    private String email;
    private String password;
    
    public abstract boolean login();
    
    public abstract void logout();
}

