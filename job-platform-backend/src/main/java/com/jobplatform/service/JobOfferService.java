package com.jobplatform.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobplatform.dto.ExtractorResponse;
import com.jobplatform.dto.JobOfferDto;
import com.jobplatform.entity.JobOffer;
import com.jobplatform.dto.JobOfferLiteDto;
import com.jobplatform.entity.User;
import com.jobplatform.repository.JobOfferRepository;
import com.jobplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobOfferService {
    
    @Autowired
    private JobOfferRepository jobOfferRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ExtractorService extractorService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Create a new job offer from form data
     */
    public JobOfferDto createJobOffer(Long offererId, String title, String company, String description) {
        User offerer = userRepository.findById(offererId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        JobOffer jobOffer = new JobOffer(offerer, title, company, description);
        jobOffer.setRawText(description);
        
        // Try to extract structured data
        try {
            ExtractorResponse extractedData = extractorService.extractFromText(description);
            populateJobOfferFromExtraction(jobOffer, extractedData);
        } catch (Exception e) {
            // If extraction fails, continue with basic data
            System.err.println("Extraction failed: " + e.getMessage());
        }
        
        JobOffer savedJobOffer = jobOfferRepository.save(jobOffer);
        return new JobOfferDto(savedJobOffer);
    }
    
    /**
     * Create a new job offer from uploaded file
     */
    public JobOfferDto createJobOfferFromFile(Long offererId, String title, MultipartFile file) {
        User offerer = userRepository.findById(offererId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            // Extract structured data from file
            ExtractorResponse extractedData = extractorService.extractFromFile(file);
            
            // Create job offer with extracted data
            JobOffer jobOffer = new JobOffer();
            jobOffer.setOfferer(offerer);
            jobOffer.setTitle(title); // Use user-provided title
            jobOffer.setRawText(extractedData.getRawText());
            jobOffer.setExtractedData(objectMapper.writeValueAsString(extractedData));
            
            // Populate fields from extraction
            populateJobOfferFromExtraction(jobOffer, extractedData);
            
            JobOffer savedJobOffer = jobOfferRepository.save(jobOffer);
            return new JobOfferDto(savedJobOffer);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to process file: " + e.getMessage(), e);
        }
    }
    
    /**
     * Populate job offer fields from extraction response
     */
    private void populateJobOfferFromExtraction(JobOffer jobOffer, ExtractorResponse extractedData) {
        // Set basic fields - only set title if not already provided by user
        if (jobOffer.getTitle() == null || jobOffer.getTitle().trim().isEmpty()) {
            if (extractedData.getJobTitle() != null && extractedData.getJobTitle().getValue() != null) {
                jobOffer.setTitle(extractedData.getJobTitle().getValue());
            }
        }
        
        if (extractedData.getCompany() != null && extractedData.getCompany().getValue() != null) {
            jobOffer.setCompany(extractedData.getCompany().getValue());
        }
        
        if (extractedData.getLocation() != null && extractedData.getLocation().getValue() != null) {
            jobOffer.setLocation(String.join(", ", extractedData.getLocation().getValue()));
        }
        
        if (extractedData.getContractType() != null && !extractedData.getContractType().isEmpty()) {
            jobOffer.setContractType(String.join(", ", extractedData.getContractType()));
        }
        
        if (extractedData.getInferredDomain() != null) {
            jobOffer.setDomain(extractedData.getInferredDomain());
        }
        
        if (extractedData.getSkills() != null && !extractedData.getSkills().isEmpty()) {
            String skillsJson = extractedData.getSkills().stream()
                .map(skill -> skill.getSkill())
                .collect(Collectors.joining(", "));
            jobOffer.setSkills(skillsJson);
        }
        
        if (extractedData.getSalary() != null && !extractedData.getSalary().isEmpty()) {
            jobOffer.setSalary(String.join(", ", extractedData.getSalary()));
        }
        
        if (extractedData.getDuration() != null && !extractedData.getDuration().isEmpty()) {
            jobOffer.setDuration(String.join(", ", extractedData.getDuration()));
        }
        
        if (extractedData.getDeadline() != null && !extractedData.getDeadline().isEmpty()) {
            jobOffer.setDeadline(String.join(", ", extractedData.getDeadline()));
        }
        
        if (extractedData.getContacts() != null) {
            try {
                jobOffer.setContacts(objectMapper.writeValueAsString(extractedData.getContacts()));
            } catch (JsonProcessingException e) {
                // Handle JSON serialization error
                System.err.println("Failed to serialize contacts: " + e.getMessage());
            }
        }
        
        if (extractedData.getLanguage() != null) {
            jobOffer.setLanguage(extractedData.getLanguage());
        }
        
        if (extractedData.getType() != null) {
            jobOffer.setType(extractedData.getType());
        }
        
        // Set description from raw text if not already set
        if (jobOffer.getDescription() == null && extractedData.getRawText() != null) {
            jobOffer.setDescription(extractedData.getRawText());
        }
    }
    
    /**
     * Get all job offers with pagination
     */
    public Page<JobOfferDto> getAllJobOffers(Pageable pageable) {
        Page<JobOffer> jobOffers = jobOfferRepository.findByIsActiveTrue(pageable);
        return jobOffers.map(JobOfferDto::new);
    }
    
    /**
     * Get job offers by offerer
     */
    public Page<JobOfferDto> getJobOffersByOfferer(Long offererId, Pageable pageable) {
        Page<JobOffer> jobOffers = jobOfferRepository.findByOffererId(offererId, pageable);
        return jobOffers.map(JobOfferDto::new);
    }

    /**
     * Get lightweight job offers by offerer
     */
    public Page<JobOfferLiteDto> getJobOffersByOffererLite(Long offererId, Pageable pageable) {
        Page<JobOffer> jobOffers = jobOfferRepository.findByOffererId(offererId, pageable);
        return jobOffers.map(JobOfferLiteDto::new);
    }
    
    /**
     * Search job offers with filters
     */
    public Page<JobOfferDto> searchJobOffers(String keyword, String domain, String contractType, 
                                            String location, Pageable pageable) {
        Page<JobOffer> jobOffers = jobOfferRepository.searchWithFilters(
            keyword, domain, contractType, location, pageable);
        return jobOffers.map(JobOfferDto::new);
    }
    
    /**
     * Get job offer by ID
     */
    public Optional<JobOfferDto> getJobOfferById(Long id) {
        return jobOfferRepository.findById(id)
            .map(JobOfferDto::new);
    }
    
    /**
     * Update job offer
     */
    public JobOfferDto updateJobOffer(Long id, String title, String company, String description) {
        JobOffer jobOffer = jobOfferRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Job offer not found"));
        
        jobOffer.setTitle(title);
        jobOffer.setCompany(company);
        jobOffer.setDescription(description);
        jobOffer.setRawText(description);
        
        // Re-extract structured data
        try {
            ExtractorResponse extractedData = extractorService.extractFromText(description);
            populateJobOfferFromExtraction(jobOffer, extractedData);
        } catch (Exception e) {
            System.err.println("Re-extraction failed: " + e.getMessage());
        }
        
        JobOffer savedJobOffer = jobOfferRepository.save(jobOffer);
        return new JobOfferDto(savedJobOffer);
    }
    
    /**
     * Update job offer active status
     */
    public JobOfferDto updateJobOfferStatus(Long id, boolean isActive) {
        JobOffer jobOffer = jobOfferRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Job offer not found"));
        jobOffer.setIsActive(isActive);
        JobOffer savedJobOffer = jobOfferRepository.save(jobOffer);
        return new JobOfferDto(savedJobOffer);
    }

    /**
     * Delete job offer
     */
    public void deleteJobOffer(Long id) {
        JobOffer jobOffer = jobOfferRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Job offer not found"));
        
        jobOfferRepository.delete(jobOffer);
    }
    
    /**
     * Get job offer statistics
     */
    public Map<String, Object> getJobOfferStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalActive", jobOfferRepository.countActiveJobOffers());
        stats.put("topDomains", jobOfferRepository.getTopDomains());
        stats.put("topContractTypes", jobOfferRepository.getTopContractTypes());
        stats.put("topLocations", jobOfferRepository.getTopLocations());
        return stats;
    }
    
    /**
     * Get job offer statistics by offerer
     */
    public Map<String, Object> getJobOfferStatsByOfferer(Long offererId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalActive", jobOfferRepository.countActiveJobOffersByOfferer(offererId));
        return stats;
    }
}
