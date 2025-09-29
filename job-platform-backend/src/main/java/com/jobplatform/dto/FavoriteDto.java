package com.jobplatform.dto;

import java.time.LocalDateTime;

public class FavoriteDto {
    private Long id;
    private Long seekerId;
    private Long jobOfferId;
    private JobOfferDto jobOffer;
    private LocalDateTime createdAt;
    
    // Constructors
    public FavoriteDto() {}
    
    public FavoriteDto(Long id, Long seekerId, Long jobOfferId, JobOfferDto jobOffer, LocalDateTime createdAt) {
        this.id = id;
        this.seekerId = seekerId;
        this.jobOfferId = jobOfferId;
        this.jobOffer = jobOffer;
        this.createdAt = createdAt;
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
    
    public Long getJobOfferId() {
        return jobOfferId;
    }
    
    public void setJobOfferId(Long jobOfferId) {
        this.jobOfferId = jobOfferId;
    }
    
    public JobOfferDto getJobOffer() {
        return jobOffer;
    }
    
    public void setJobOffer(JobOfferDto jobOffer) {
        this.jobOffer = jobOffer;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
