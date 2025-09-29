package com.jobplatform.dto;

import com.jobplatform.entity.JobOffer;

import java.time.LocalDateTime;

public class JobOfferLiteDto {

    private Long id;
    private Long offererId;
    private String title;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private String rawText;

    public JobOfferLiteDto() {}

    public JobOfferLiteDto(JobOffer jobOffer) {
        this.id = jobOffer.getId();
        this.offererId = jobOffer.getOfferer() != null ? jobOffer.getOfferer().getId() : null;
        this.title = jobOffer.getTitle();
        this.createdAt = jobOffer.getCreatedAt();
        this.isActive = jobOffer.getIsActive();
        this.rawText = jobOffer.getRawText();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOffererId() {
        return offererId;
    }

    public void setOffererId(Long offererId) {
        this.offererId = offererId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }
}


