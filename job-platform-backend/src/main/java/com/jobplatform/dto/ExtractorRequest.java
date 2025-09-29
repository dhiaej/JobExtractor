package com.jobplatform.dto;

import jakarta.validation.constraints.NotBlank;

public class ExtractorRequest {
    
    @NotBlank(message = "Text is required")
    private String text;
    
    // Constructors
    public ExtractorRequest() {}
    
    public ExtractorRequest(String text) {
        this.text = text;
    }
    
    // Getters and Setters
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
}
