package com.jobplatform.dto;

import com.jobplatform.entity.JobOffer;

import java.time.LocalDateTime;

public class JobOfferDto {
    
    private Long id;
    private Long offererId;
    private String offererName;
    private String title;
    private String company;
    private String location;
    private String contractType;
    private String domain;
    private String skills;
    private String salary;
    private String duration;
    private String deadline;
    private String description;
    private String rawText;
    private String extractedData;
    private String contacts;
    private String language;
    private String type;
    private LocalDateTime createdAt;
    private Boolean isActive;
    
    // Constructors
    public JobOfferDto() {}
    
    public JobOfferDto(JobOffer jobOffer) {
        this.id = jobOffer.getId();
        this.offererId = jobOffer.getOfferer().getId();
        this.offererName = jobOffer.getOfferer().getName();
        this.title = jobOffer.getTitle();
        this.company = jobOffer.getCompany();
        this.location = jobOffer.getLocation();
        this.contractType = jobOffer.getContractType();
        this.domain = jobOffer.getDomain();
        this.skills = jobOffer.getSkills();
        this.salary = jobOffer.getSalary();
        this.duration = jobOffer.getDuration();
        this.deadline = jobOffer.getDeadline();
        this.description = jobOffer.getDescription();
        this.rawText = jobOffer.getRawText();
        this.extractedData = jobOffer.getExtractedData();
        this.contacts = jobOffer.getContacts();
        this.language = jobOffer.getLanguage();
        this.type = jobOffer.getType();
        this.createdAt = jobOffer.getCreatedAt();
        this.isActive = jobOffer.getIsActive();
    }
    
    // Getters and Setters
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
    
    public String getOffererName() {
        return offererName;
    }
    
    public void setOffererName(String offererName) {
        this.offererName = offererName;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getCompany() {
        return company;
    }
    
    public void setCompany(String company) {
        this.company = company;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getContractType() {
        return contractType;
    }
    
    public void setContractType(String contractType) {
        this.contractType = contractType;
    }
    
    public String getDomain() {
        return domain;
    }
    
    public void setDomain(String domain) {
        this.domain = domain;
    }
    
    public String getSkills() {
        return skills;
    }
    
    public void setSkills(String skills) {
        this.skills = skills;
    }
    
    public String getSalary() {
        return salary;
    }
    
    public void setSalary(String salary) {
        this.salary = salary;
    }
    
    public String getDuration() {
        return duration;
    }
    
    public void setDuration(String duration) {
        this.duration = duration;
    }
    
    public String getDeadline() {
        return deadline;
    }
    
    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getRawText() {
        return rawText;
    }
    
    public void setRawText(String rawText) {
        this.rawText = rawText;
    }
    
    public String getExtractedData() {
        return extractedData;
    }
    
    public void setExtractedData(String extractedData) {
        this.extractedData = extractedData;
    }
    
    public String getContacts() {
        return contacts;
    }
    
    public void setContacts(String contacts) {
        this.contacts = contacts;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
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
}
