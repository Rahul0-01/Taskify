//This interface provides methods to interact with the database for
// user-related operations like saving and retrieving users.
// i.e. this will provide methods to help service layer to save and retrieve users

package com.Rahul.taskify.Repository;

import com.Rahul.taskify.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
// user here is the name of table which is User(as we used @Entity in user class) and long is the type of Primary class
public interface UserRepository extends JpaRepository<User,Long> {

    Optional<User> findByUserName(String userName);
}


/* What is Optional<User> findByUserName(String userName);?
This is a custom method inside your UserRepository interface. It helps you find a user by their username in the database. Let’s break it down:

1️⃣ What does Optional<User> mean?
User → This means the method will return a User object.
Optional<User> → It means the result may or may not contain a User.
If a user is found → It returns the User.
If a user is NOT found → It returns Optional.empty() (which means "nothing found").
Why use Optional? It prevents errors like "User not found" (NullPointerException).
2️⃣ What does findByUserName(String userName) do?
This is a query method that tells Spring Data JPA:
"Find a user where the userName column in the database matches the given userName."
Spring Boot automatically understands this method and converts it into a database query! 🤯 You don’t need to write SQL manually.
3️⃣ How does it work?
When you call this method in your service layer, Spring Boot automatically runs this SQL query behind the scenes:


SELECT * FROM user WHERE user_name = ?;
The ? is replaced by the userName you pass as a parameter.

4️⃣ Example Usage
Let’s say you have a database with these users:

ID	Username	Password
1	rahul123	abc123
2	johnDoe	pass123
🔹 Code Example:

Optional<User> user = userRepository.findByUserName("rahul123");
➡ This will search for "rahul123" in the database and return the User object if found.

🔹 What if the user is found?

if(user.isPresent()) {
    System.out.println("User found: " + user.get().getUserName());
}
Output:
User found: rahul123

🔹 What if the user is NOT found?
if(user.isEmpty()) {
    System.out.println("User not found");
}
Output:
User not found

Summary (Easiest Explanation 😘)
✅ findByUserName(String userName) searches for a user in the database by username.
✅ If the user exists, it returns the User object inside Optional.
✅ If the user doesn’t exist, it returns Optional.empty() (meaning "nothing found").
✅ Spring Boot automatically understands this method and converts it into an SQL query.

 */