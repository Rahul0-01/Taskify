// we create new model class so that it is easy to handle ... means which data we need to authenticate the user to login
// like we need username . userpassword so we basically create these instance varaible. later in future if we need Remember me boolean then we have just have to
// mention it here and little much code changes but if dont use this clas instead use controller directly then it will be a little much difficult to do




// CHATGPT ------------------>

/*       Instead of directly accepting username and password in the controller method, we wrap them in a DTO (Data Transfer Object).
This makes the controller method cleaner and easier to read.
Without LoginRequest (Messy Code)

java
Copy
Edit
@PostMapping("/login")
public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {
    String username = request.get("userName");
    String password = request.get("password");

    return userService.loginUser(username, password);
}
Here, we are using a Map<String, String>, which is not a good practice.
If you want to add more fields (e.g., email, captcha, etc.), you’ll have to modify multiple parts of the code.
With LoginRequest (Better Code)

java
Copy
Edit
@PostMapping("/login")
public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
    return userService.loginUser(loginRequest);
}
Now, LoginRequest acts as a structured input, and if we need to add more fields, we just modify the LoginRequest class.
2️⃣ Scalability – Easy to Extend in Future
If tomorrow you need extra fields (like a captcha, remember-me flag, etc.), you just add them in LoginRequest without changing the controller method.
Example:
java
Copy
Edit
public class LoginRequest {
    private String userName;
    private String password;
    private boolean rememberMe; // New field added
}
This doesn’t break existing code! 🚀

3️⃣ Better Validation Handling
With LoginRequest, you can validate input using @Valid annotations in Spring Boot.
Example:
java
Copy
Edit
public class LoginRequest {
    @NotBlank
    private String userName;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
This automatically validates requests before they reach the service layer.

*/


package com.Rahul.taskify.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class LoginRequest {

    private String userName;
    private String userPassword;
}


