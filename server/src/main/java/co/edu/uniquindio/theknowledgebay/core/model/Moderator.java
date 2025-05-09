package co.edu.uniquindio.theknowledgebay.core.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class Moderator extends User {

    @Override
    public boolean login() {
        // TODO: implement functionality
        return false;
    }

    @Override
    public void logout() {
        // TODO: implement functionality
    }

    public void manageUsers() {
        // TODO: implement functionality
    }

    public void manageContents() {
        // TODO: implement functionality
    }

    public void generateReports() {
        // TODO: implement functionality
    }

    public void viewAffinityGraph() {
        // TODO: implement functionality
    }
}