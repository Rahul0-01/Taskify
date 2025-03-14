/* This class defines a User with an ID, username, password, and roles.
It ensures passwords and usernames are stored properly and that roles are linked correctly.
  this class is formed which defines what the user will have in database means to make the table of users inside the database

 */


package com.Rahul.taskify.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "users")
public class User {
      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private long id;

      @Column(unique = true , nullable = false)
      private String userName;
      @Column(nullable = false)
      private String password;
    @ElementCollection(fetch = FetchType.EAGER)
    private Set<String> roles;

    //@ElementCollection(fetch = FetchType.EAGER) →
    //Since roles are a collection (Set), they are stored in a separate table.
    //The EAGER fetch type ensures that roles are loaded immediately when the user is fetched from the database.
    //means @Element collection is used to make a separate table and then fetchtype eager is used to fetch immediately.

}
