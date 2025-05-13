package com.Rahul.taskify.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils; // For joining DataBuffers
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

// Required Reactor Core imports
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

// Required for Map creation
import java.util.Map;

// Required for RuntimeException
import java.lang.RuntimeException;

// NO IO, ExecutorService, DisposableBean, or Pipe imports needed

@Service
public class ElevenLabsService { // No DisposableBean needed

    private static final Logger log = LoggerFactory.getLogger(ElevenLabsService.class);
    private final WebClient webClient;

    @Value("${elevenlabs.api.key}")
    private String apiKey;

    @Value("${elevenlabs.voice.id}")
    private String voiceId;

    // ExecutorService is NOT needed for this byte[] approach

    public ElevenLabsService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("https://api.elevenlabs.io/v1")
                .build();
    }

    // --- PRIVATE: Performs the reactive WebClient call ---
    // Returns the stream from ElevenLabs as a Flux
    private Flux<DataBuffer> getSpeechFluxFromApi(String textToSpeak) {
        if (apiKey == null || apiKey.isBlank()) {
            log.error("ElevenLabs API Key is missing in configuration!");
            return Flux.error(new IllegalStateException("TTS Service API Key not configured."));
        }

        String url = String.format("/text-to-speech/%s/stream?optimize_streaming_latency=1", voiceId);
        log.info("Calling ElevenLabs API endpoint: {}", url);

        // Use the model and settings confirmed to work previously or default ones
        Map<String, Object> requestBody = Map.of(
                "text", textToSpeak,
                "model_id", "eleven_monolingual_v1",
                "voice_settings", Map.of(
                        "stability", 0.5,
                        "similarity_boost", 0.5
                )
        );

        return this.webClient.post()
                .uri(url)
                .header("xi-api-key", apiKey)
                .header(HttpHeaders.ACCEPT, "audio/mpeg") // Request MPEG audio
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(
                        status -> status.isError(), // More concise check for any error status
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .defaultIfEmpty("[No error body from ElevenLabs]")
                                .flatMap(errorBody -> {
                                    log.error("ElevenLabs API call failed - Status: {}, Body: {}", clientResponse.statusCode(), errorBody);
                                    String errorMessage = String.format("ElevenLabs API Error: %s - %s", clientResponse.statusCode(), errorBody);
                                    return Mono.error(new RuntimeException(errorMessage));
                                })
                )
                .bodyToFlux(DataBuffer.class) // Get successful audio stream as Flux
                .doOnError(error -> log.error("Error received in ElevenLabs Flux stream: {}", error.getMessage()));
    }

    // --- PUBLIC: Returns collected byte array (BLOCKING!) ---
    // This is the method the non-streaming Controller will call
    public byte[] generateSpeechAsBytes(String textToSpeak) {
        log.info("--- generateSpeechAsBytes: Calling API and collecting bytes (BLOCKING operation started) ---");
        Flux<DataBuffer> dataBufferFlux = getSpeechFluxFromApi(textToSpeak);

        // Join the Flux<DataBuffer> into a single DataBuffer (Mono<DataBuffer>)
        // Then map that DataBuffer to a byte[]
        Mono<byte[]> monoBytes = DataBufferUtils.join(dataBufferFlux)
                .map(dataBuffer -> {
                    // This map operation happens *after* join completes
                    byte[] bytes = new byte[dataBuffer.readableByteCount()];
                    dataBuffer.read(bytes); // Read bytes from the joined buffer
                    DataBufferUtils.release(dataBuffer); // Release the joined buffer
                    log.debug("--- generateSpeechAsBytes: Mapped joined DataBuffer to byte array ---");
                    return bytes;
                })
                .doOnError(error -> log.error("--- generateSpeechAsBytes: Error during DataBuffer join/map: {}", error.getMessage(), error)); // Log errors during join/map


        // Block the Mono to get the result synchronously.
        // This should only be done when the calling layer (MVC controller) requires a synchronous result.
        // Add a timeout to prevent blocking indefinitely in case of issues.
        byte[] resultBytes = null;
        try {
            // Use blockOptional for better handling of empty streams, with a timeout
            resultBytes = monoBytes.blockOptional(java.time.Duration.ofSeconds(30)) // e.g., 30 second timeout
                    .orElse(null); // Return null if timeout or empty
        } catch (Exception e) {
            log.error("--- generateSpeechAsBytes: Exception during .blockOptional(): {} ---", e.getMessage(), e);
            // Rethrow or handle as appropriate, maybe return null or throw custom exception
            // For simplicity, letting it propagate or returning null if caught
            throw new RuntimeException("Failed to get audio bytes within timeout or due to error: " + e.getMessage(), e);
        }


        if (resultBytes == null) {
            log.warn("--- generateSpeechAsBytes: Finished collecting, but result is null (potentially empty stream or timeout). ---");
        } else {
            log.info("--- generateSpeechAsBytes: Finished collecting ({} bytes). Returning. ---", resultBytes.length);
        }
        return resultBytes;
    }

    // NOTE: The generateSpeechInputStream method and pipeExecutor/DisposableBean are removed
}