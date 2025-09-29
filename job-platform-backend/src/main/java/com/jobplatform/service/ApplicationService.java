package com.jobplatform.service;

import com.jobplatform.dto.ApplicationDto;
import com.jobplatform.entity.Application;
import com.jobplatform.entity.JobOffer;
import com.jobplatform.entity.User;
import com.jobplatform.repository.ApplicationRepository;
import com.jobplatform.repository.JobOfferRepository;
import com.jobplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ApplicationService {
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JobOfferRepository jobOfferRepository;
    
    /**
     * Apply to a job offer
     */
    public ApplicationDto applyToJob(Long seekerId, Long jobOfferId, String coverLetter, String resumeUrl) {
        // Check if seeker already applied
        Optional<Application> existingApplication = applicationRepository
            .findBySeekerIdAndJobOfferId(seekerId, jobOfferId);
        
        if (existingApplication.isPresent()) {
            throw new RuntimeException("You have already applied to this job");
        }
        
        User seeker = userRepository.findById(seekerId)
            .orElseThrow(() -> new RuntimeException("Seeker not found"));
        
        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
            .orElseThrow(() -> new RuntimeException("Job offer not found"));
        
        Application application = new Application(seeker, jobOffer);
        application.setCoverLetter(coverLetter);
        application.setResumeUrl(resumeUrl);
        
        Application savedApplication = applicationRepository.save(application);
        return new ApplicationDto(savedApplication);
    }
    
    /**
     * Get applications by seeker
     */
    public Page<ApplicationDto> getApplicationsBySeeker(Long seekerId, Pageable pageable) {
        Page<Application> applications = applicationRepository.findBySeekerId(seekerId, pageable);
        return applications.map(ApplicationDto::new);
    }
    
    /**
     * Get applications by job offer
     */
    public Page<ApplicationDto> getApplicationsByJobOffer(Long jobOfferId, Pageable pageable) {
        Page<Application> applications = applicationRepository.findByJobOfferId(jobOfferId, pageable);
        return applications.map(ApplicationDto::new);
    }
    
    /**
     * Get applications by offerer (through job offers)
     */
    public Page<ApplicationDto> getApplicationsByOfferer(Long offererId, Pageable pageable) {
        Page<Application> applications = applicationRepository.findByOffererId(offererId, pageable);
        return applications.map(ApplicationDto::new);
    }
    
    /**
     * Get applications by status
     */
    public Page<ApplicationDto> getApplicationsByStatus(Application.ApplicationStatus status, Pageable pageable) {
        Page<Application> applications = applicationRepository.findByStatus(status, pageable);
        return applications.map(ApplicationDto::new);
    }
    
    /**
     * Get applications by seeker and status
     */
    public Page<ApplicationDto> getApplicationsBySeekerAndStatus(Long seekerId, 
                                                               Application.ApplicationStatus status, 
                                                               Pageable pageable) {
        Page<Application> applications = applicationRepository.findBySeekerIdAndStatus(seekerId, status, pageable);
        return applications.map(ApplicationDto::new);
    }
    
    /**
     * Get applications by job offer and status
     */
    public Page<ApplicationDto> getApplicationsByJobOfferAndStatus(Long jobOfferId, 
                                                                 Application.ApplicationStatus status, 
                                                                 Pageable pageable) {
        Page<Application> applications = applicationRepository.findByJobOfferIdAndStatus(jobOfferId, status, pageable);
        return applications.map(ApplicationDto::new);
    }
    
    /**
     * Update application status
     */
    public ApplicationDto updateApplicationStatus(Long applicationId, Application.ApplicationStatus status) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        application.setStatus(status);
        Application savedApplication = applicationRepository.save(application);
        return new ApplicationDto(savedApplication);
    }
    
    /**
     * Get application by ID
     */
    public Optional<ApplicationDto> getApplicationById(Long id) {
        return applicationRepository.findById(id)
            .map(ApplicationDto::new);
    }
    
    /**
     * Check if seeker already applied to job offer
     */
    public boolean hasApplied(Long seekerId, Long jobOfferId) {
        return applicationRepository.findBySeekerIdAndJobOfferId(seekerId, jobOfferId).isPresent();
    }
    
    /**
     * Get application statistics
     */
    public Map<String, Object> getApplicationStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Object[]> statusCounts = applicationRepository.getApplicationStatusCounts();
        Map<String, Long> statusMap = new HashMap<>();
        for (Object[] statusCount : statusCounts) {
            statusMap.put(statusCount[0].toString(), (Long) statusCount[1]);
        }
        
        stats.put("statusCounts", statusMap);
        return stats;
    }
    
    /**
     * Get application statistics by seeker
     */
    public Map<String, Object> getApplicationStatsBySeeker(Long seekerId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalApplications", applicationRepository.countApplicationsBySeeker(seekerId));
        return stats;
    }
    
    /**
     * Get application statistics by offerer
     */
    public Map<String, Object> getApplicationStatsByOfferer(Long offererId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalApplications", applicationRepository.countApplicationsByOfferer(offererId));
        return stats;
    }
    
    /**
     * Get application statistics by job offer
     */
    public Map<String, Object> getApplicationStatsByJobOffer(Long jobOfferId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalApplications", applicationRepository.countApplicationsByJobOffer(jobOfferId));
        return stats;
    }
}
