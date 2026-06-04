package com.ecoquest.exception;

import org.springframework.http.HttpStatus;

public class EcoQuestException extends RuntimeException {
    private final HttpStatus status;

    public EcoQuestException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() { return status; }
}
