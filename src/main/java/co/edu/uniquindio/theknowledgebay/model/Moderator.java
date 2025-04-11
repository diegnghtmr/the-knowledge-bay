package co.edu.uniquindio.theknowledgebay.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "moderators")
@Data
@NoArgsConstructor
@SuperBuilder
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