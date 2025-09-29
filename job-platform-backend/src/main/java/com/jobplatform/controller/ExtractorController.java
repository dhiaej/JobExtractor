package com.jobplatform.controller;

import com.jobplatform.dto.ExtractorRequest;
import com.jobplatform.dto.ExtractorResponse;
import com.jobplatform.service.ExtractorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/extractor")
@CrossOrigin(origins = "http://localhost:4200")
public class ExtractorController {
    
    @Autowired
    private ExtractorService extractorService;
    
    /**
     * Extract job information from text
     */
    @PostMapping("/extract")
    public ResponseEntity<ExtractorResponse> extractFromText(@RequestBody ExtractorRequest request) {
        try {
            ExtractorResponse response = extractorService.extractFromText(request.getText());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Extract job information from uploaded file
     */
    @PostMapping("/extract-file")
    public ResponseEntity<ExtractorResponse> extractFromFile(@RequestParam("file") MultipartFile file) {
        try {
            ExtractorResponse response = extractorService.extractFromFile(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Check if extractor service is available
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getExtractorStatus() {
        Map<String, Object> status = extractorService.getExtractorStatus();
        return ResponseEntity.ok(status);
    }
}
