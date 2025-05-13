package com.Rahul.taskify.Controller;

// Spring MVC imports
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Logging imports
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// Service and DTO imports (verify paths)
import com.Rahul.taskify.Service.ElevenLabsService;
import com.Rahul.taskify.dto.TtsRequest;

// NO StreamingResponseBody, IO imports needed

@RestController
@RequestMapping("/api/tts")
@CrossOrigin(origins = {"http://localhost:3000", "https://your-deployed-frontend.com"}) // Adjust as needed
public class TtsController {

    private static final Logger log = LoggerFactory.getLogger(TtsController.class);
    private final ElevenLabsService elevenLabsService;

    // Constructor Injection
    public TtsController(ElevenLabsService elevenLabsService) {
        this.elevenLabsService = elevenLabsService;
    }

    // --- generateSpeech method returning byte[] (NON-STREAMING) ---
    @PostMapping("/generate")
    public ResponseEntity<?> generateSpeech(@RequestBody TtsRequest request) { // Use ResponseEntity<?> for flexible error return

        log.info("--- TTS Controller (byte[]): Received POST /generate ---");

        if (request == null || request.getText() == null || request.getText().isBlank()) {
            log.warn("--- TTS Controller (byte[]): Bad request - Request body or text field is missing/blank. ---");
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Request text is missing."); // Return plain text error
        }

        String textSnippet = request.getText().substring(0, Math.min(request.getText().length(), 50));
        log.info("--- TTS Controller (byte[]): Request Body Text (snippet): '{}' ---", textSnippet);

        try {
            log.info("--- TTS Controller (byte[]): Attempting to call elevenLabsService.generateSpeechAsBytes... ---");
            // Calls the method in the service that blocks and returns byte[]
            byte[] audioBytes = elevenLabsService.generateSpeechAsBytes(request.getText());

            if (audioBytes == null || audioBytes.length == 0) {
                log.warn("--- TTS Controller (byte[]): Service returned empty or null byte array. Check service logs for details. ---");
                return ResponseEntity.internalServerError()
                        .contentType(MediaType.TEXT_PLAIN)
                        .body("Failed to generate audio data (empty response from service).");
            }

            log.info("--- TTS Controller (byte[]): Service returned {} bytes. Preparing OK response... ---", audioBytes.length);

            // Return the complete byte array successfully
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM) // Correct MIME type for generic binary
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(audioBytes.length)) // Set Content-Length
                    .body(audioBytes); // Set the byte array as the body

        } catch (Exception e) { // Catches exceptions from the service layer (e.g., API key error, ElevenLabs API error, blocking timeout)
            log.error("--- TTS Controller (byte[]): Error during service call or processing: {} ---", e.getMessage(), e);
            // Return a generic 500 error, including the exception message from the service
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Error generating speech: " + e.getMessage());
        }
    }

    
}