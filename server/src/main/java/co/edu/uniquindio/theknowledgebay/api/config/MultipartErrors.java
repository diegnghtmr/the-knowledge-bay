package co.edu.uniquindio.theknowledgebay.api.config;

import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.core.service.AttachmentStorage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class MultipartErrors {
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<AuthResponseDTO> tooLarge() {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new AuthResponseDTO(false, AttachmentStorage.SIZE_ERROR));
    }
}
