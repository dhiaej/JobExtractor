package com.jobplatform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_offers")
public class JobOffer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offerer_id", nullable = false)
    @NotNull(message = "Offerer is required")
    private User offerer;
    
    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;
    
    @NotBlank(message = "Company is required")
    @Column(nullable = false)
    private String company;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "contract_type")
    private String contractType;
    
    @Column(name = "domain")
    private String domain;
    
    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills; // JSON string of skills
    
    @Column(name = "salary")
    private String salary;
    
    @Column(name = "duration")
    private String duration;
    
    @Column(name = "deadline")
    private String deadline;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "raw_text", columnDefinition = "LONGTEXT")
    private String rawText;
    
    @Column(name = "extracted_data", columnDefinition = "LONGTEXT")
    private String extractedData; // JSON string of full extraction result
    
    @Column(name = "contacts", columnDefinition = "TEXT")
    private String contacts; // JSON string of contacts
    
    @Column(name = "language")
    private String language;
    
    @Column(name = "type")
    private String type; // "Job" or "Internship"
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    // Constructors
    public JobOffer() {}
    
    public JobOffer(User offerer, String title, String company, String description) {
        this.offerer = offerer;
        this.title = title;
        this.company = company;
        this.description = description;
        this.isActive = true;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getOfferer() {
        return offerer;
    }
    
    public void setOfferer(User offerer) {
        this.offerer = offerer;
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
