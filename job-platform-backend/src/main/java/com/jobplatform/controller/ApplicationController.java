package com.jobplatform.controller;

import com.jobplatform.dto.ApplicationDto;
import com.jobplatform.entity.Application;
import com.jobplatform.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:4200")
public class ApplicationController {
    
    @Autowired
    private ApplicationService applicationService;
    
    /**
     * Apply to a job offer
     */
    @PostMapping("/apply")
    public ResponseEntity<ApplicationDto> applyToJob(
            @RequestParam Long seekerId,
            @RequestParam Long jobOfferId,
            @RequestParam(required = false) String coverLetter,
            @RequestParam(required = false) String resumeUrl) {
        
        try {
            ApplicationDto application = applicationService.applyToJob(seekerId, jobOfferId, coverLetter, resumeUrl);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get applications by seeker
     */
    @GetMapping("/seeker/{seekerId}")
    public ResponseEntity<Page<ApplicationDto>> getApplicationsBySeeker(
            @PathVariable Long seekerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ApplicationDto> applications = applicationService.getApplicationsBySeeker(seekerId, pageable);
        return ResponseEntity.ok(applications);
    }
    
    /**
     * Get applications by job offer
     */
    @GetMapping("/job-offer/{jobOfferId}")
    public ResponseEntity<Page<ApplicationDto>> getApplicationsByJobOffer(
            @PathVariable Long jobOfferId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ApplicationDto> applications = applicationService.getApplicationsByJobOffer(jobOfferId, pageable);
        return ResponseEntity.ok(applications);
    }
    
    /**
     * Get applications by offerer
     */
    @GetMapping("/offerer/{offererId}")
    public ResponseEntity<Page<ApplicationDto>> getApplicationsByOfferer(
            @PathVariable Long offererId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ApplicationDto> applications = applicationService.getApplicationsByOfferer(offererId, pageable);
        return ResponseEntity.ok(applications);
    }
    
    /**
     * Get applications by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<ApplicationDto>> getApplicationsByStatus(
            @PathVariable Application.ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ApplicationDto> applications = applicationService.getApplicationsByStatus(status, pageable);
        return ResponseEntity.ok(applications);
    }
    
    /**
     * Get applications by seeker and status
     */
    @GetMapping("/seeker/{seekerId}/status/{status}")
    public ResponseEntity<Page<ApplicationDto>> getApplicationsBySeekerAndStatus(
            @PathVariable Long seekerId,
            @PathVariable Application.ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ApplicationDto> applications = applicationService.getApplicationsBySeekerAndStatus(seekerId, status, pageable);
        return ResponseEntity.ok(applications);
    }
    
    /**
     * Get applications by job offer and status
     */
    @GetMapping("/job-offer/{jobOfferId}/status/{status}")
    public ResponseEntity<Page<ApplicationDto>> getApplicationsByJobOfferAndStatus(
            @PathVariable Long jobOfferId,
            @PathVariable Application.ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ApplicationDto> applications = applicationService.getApplicationsByJobOfferAndStatus(jobOfferId, status, pageable);
        return ResponseEntity.ok(applications);
    }
    
    /**
     * Update application status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApplicationDto> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam Application.ApplicationStatus status) {
        
        try {
            ApplicationDto application = applicationService.updateApplicationStatus(id, status);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get application by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDto> getApplicationById(@PathVariable Long id) {
        return applicationService.getApplicationById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Check if seeker already applied to job offer
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> hasApplied(
            @RequestParam Long seekerId,
            @RequestParam Long jobOfferId) {
        
        boolean hasApplied = applicationService.hasApplied(seekerId, jobOfferId);
        return ResponseEntity.ok(hasApplied);
    }
    
    /**
     * Get application statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getApplicationStats() {
        Map<String, Object> stats = applicationService.getApplicationStats();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get application statistics by seeker
     */
    @GetMapping("/stats/seeker/{seekerId}")
    public ResponseEntity<Map<String, Object>> getApplicationStatsBySeeker(@PathVariable Long seekerId) {
        Map<String, Object> stats = applicationService.getApplicationStatsBySeeker(seekerId);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get application statistics by offerer
     */
    @GetMapping("/stats/offerer/{offererId}")
    public ResponseEntity<Map<String, Object>> getApplicationStatsByOfferer(@PathVariable Long offererId) {
        Map<String, Object> stats = applicationService.getApplicationStatsByOfferer(offererId);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get application statistics by job offer
     */
    @GetMapping("/stats/job-offer/{jobOfferId}")
    public ResponseEntity<Map<String, Object>> getApplicationStatsByJobOffer(@PathVariable Long jobOfferId) {
        Map<String, Object> stats = applicationService.getApplicationStatsByJobOffer(jobOfferId);
        return ResponseEntity.ok(stats);
    }
}
