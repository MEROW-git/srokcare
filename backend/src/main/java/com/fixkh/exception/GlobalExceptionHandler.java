package com.fixkh.exception;

import com.fixkh.dto.ApiDtos.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private ResponseEntity<ErrorResponse> error(HttpStatus status, String message, HttpServletRequest request) {
        return ResponseEntity.status(status).body(new ErrorResponse(Instant.now(), status.value(), status.getReasonPhrase(), message, request.getRequestURI()));
    }
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> api(ApiException e, HttpServletRequest request) { return error(e.getStatus(), e.getMessage(), request); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException e, HttpServletRequest request) {
        String message = e.getBindingResult().getFieldErrors().stream().map(f -> f.getField() + ": " + f.getDefaultMessage()).distinct().collect(Collectors.joining("; "));
        return error(HttpStatus.BAD_REQUEST, message, request);
    }
    @ExceptionHandler({MethodArgumentTypeMismatchException.class, MissingServletRequestPartException.class,
            MissingServletRequestParameterException.class, HttpMessageNotReadableException.class, IllegalArgumentException.class})
    public ResponseEntity<ErrorResponse> badRequest(Exception e, HttpServletRequest request) { return error(HttpStatus.BAD_REQUEST, "Invalid request parameter or body", request); }
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(Exception e, HttpServletRequest request) { return error(HttpStatus.NOT_FOUND, "Resource not found", request); }
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> tooLarge(Exception e, HttpServletRequest request) { return error(HttpStatus.PAYLOAD_TOO_LARGE, "Upload exceeds size limit", request); }
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> conflict(Exception e, HttpServletRequest request) { return error(HttpStatus.CONFLICT, "Resource already exists or violates a constraint", request); }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> unexpected(Exception e, HttpServletRequest request) { return error(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", request); }
}
