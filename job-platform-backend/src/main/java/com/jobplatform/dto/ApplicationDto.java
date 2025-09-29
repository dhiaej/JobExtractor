package com.jobplatform.dto;

import com.jobplatform.entity.Application;

import java.time.LocalDateTime;

public class ApplicationDto {
    
    private Long id;
    private Long seekerId;
    private String seekerName;
    private String seekerEmail;
    private Long jobOfferId;
    private String jobTitle;
    private String company;
    private Application.ApplicationStatus status;
    private String coverLetter;
    private String resumeUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public ApplicationDto() {}
    
    public ApplicationDto(Application application) {
        this.id = application.getId();
        this.seekerId = application.getSeeker().getId();
        this.seekerName = application.getSeeker().getName();
        this.seekerEmail = application.getSeeker().getEmail();
        this.jobOfferId = application.getJobOffer().getId();
        this.jobTitle = application.getJobOffer().getTitle();
        this.company = application.getJobOffer().getCompany();
        this.status = application.getStatus();
        this.coverLetter = application.getCoverLetter();
        this.resumeUrl = application.getResumeUrl();
        this.createdAt = application.getCreatedAt();
        this.updatedAt = application.getUpdatedAt();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getSeekerId() {
        return seekerId;
    }
    
    public void setSeekerId(Long seekerId) {
        this.seekerId = seekerId;
    }
    
    public String getSeekerName() {
        return seekerName;
    }
    
    public void setSeekerName(String seekerName) {
        this.seekerName = seekerName;
    }
    
    public String getSeekerEmail() {
        return seekerEmail;
    }
    
    public void setSeekerEmail(String seekerEmail) {
        this.seekerEmail = seekerEmail;
    }
    
    public Long getJobOfferId() {
        return jobOfferId;
    }
    
    public void setJobOfferId(Long jobOfferId) {
        this.jobOfferId = jobOfferId;
    }
    
    public String getJobTitle() {
        return jobTitle;
    }
    
    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }
    
    public String getCompany() {
        return company;
    }
    
    public void setCompany(String company) {
        this.company = company;
    }
    
    public Application.ApplicationStatus getStatus() {
        return status;
    }
    
    public void setStatus(Application.ApplicationStatus status) {
        this.status = status;
    }
    
    public String getCoverLetter() {
        return coverLetter;
    }
    
    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }
    
    public String getResumeUrl() {
        return resumeUrl;
    }
    
    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
