package com.jobplatform.controller;

import com.jobplatform.dto.JobOfferDto;
import com.jobplatform.dto.JobOfferLiteDto;
import com.jobplatform.service.JobOfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/job-offers")
@CrossOrigin(origins = "http://localhost:4200")
public class JobOfferController {
    
    @Autowired
    private JobOfferService jobOfferService;
    
    /**
     * Get all active job offers with pagination
     */
    @GetMapping
    public ResponseEntity<Page<JobOfferDto>> getAllJobOffers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<JobOfferDto> jobOffers = jobOfferService.getAllJobOffers(pageable);
        return ResponseEntity.ok(jobOffers);
    }
    
    /**
     * Search job offers with filters
     */
    @GetMapping("/search")
    public ResponseEntity<Page<JobOfferDto>> searchJobOffers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) String contractType,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<JobOfferDto> jobOffers = jobOfferService.searchJobOffers(
            keyword, domain, contractType, location, pageable);
        return ResponseEntity.ok(jobOffers);
    }
    
    /**
     * Get job offers by offerer
     */
    @GetMapping("/offerer/{offererId}")
    public ResponseEntity<Page<JobOfferDto>> getJobOffersByOfferer(
            @PathVariable Long offererId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<JobOfferDto> jobOffers = jobOfferService.getJobOffersByOfferer(offererId, pageable);
        return ResponseEntity.ok(jobOffers);
    }

    /**
     * Get lightweight job offers by offerer (id, offererId, createdAt, isActive, rawText)
     */
    @GetMapping("/offerer/{offererId}/lite")
    public ResponseEntity<Page<JobOfferLiteDto>> getJobOffersByOffererLite(
            @PathVariable Long offererId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<JobOfferLiteDto> jobOffers = jobOfferService.getJobOffersByOffererLite(offererId, pageable);
        return ResponseEntity.ok(jobOffers);
    }
    
    /**
     * Get job offer by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobOfferDto> getJobOfferById(@PathVariable Long id) {
        return jobOfferService.getJobOfferById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create job offer from form data
     */
    @PostMapping
    public ResponseEntity<JobOfferDto> createJobOffer(
            @RequestParam Long offererId,
            @RequestParam String title,
            @RequestParam String company,
            @RequestParam String description) {
        
        try {
            JobOfferDto jobOffer = jobOfferService.createJobOffer(offererId, title, company, description);
            return ResponseEntity.ok(jobOffer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Create job offer from uploaded file
     */
    @PostMapping("/upload")
    public ResponseEntity<JobOfferDto> createJobOfferFromFile(
            @RequestParam Long offererId,
            @RequestParam String title,
            @RequestParam("file") MultipartFile file) {
        
        try {
            JobOfferDto jobOffer = jobOfferService.createJobOfferFromFile(offererId, title, file);
            return ResponseEntity.ok(jobOffer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update job offer
     */
    @PutMapping("/{id}")
    public ResponseEntity<JobOfferDto> updateJobOffer(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String company,
            @RequestParam String description) {
        
        try {
            JobOfferDto jobOffer = jobOfferService.updateJobOffer(id, title, company, description);
            return ResponseEntity.ok(jobOffer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update job offer active status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<JobOfferDto> updateJobOfferStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            boolean isActive = body != null && body.get("isActive") != null && Boolean.parseBoolean(body.get("isActive").toString());
            JobOfferDto jobOffer = jobOfferService.updateJobOfferStatus(id, isActive);
            return ResponseEntity.ok(jobOffer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Delete job offer
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobOffer(@PathVariable Long id) {
        try {
            jobOfferService.deleteJobOffer(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get job offer statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getJobOfferStats() {
        Map<String, Object> stats = jobOfferService.getJobOfferStats();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get job offer statistics by offerer
     */
    @GetMapping("/stats/offerer/{offererId}")
    public ResponseEntity<Map<String, Object>> getJobOfferStatsByOfferer(@PathVariable Long offererId) {
        Map<String, Object> stats = jobOfferService.getJobOfferStatsByOfferer(offererId);
        return ResponseEntity.ok(stats);
    }
}
