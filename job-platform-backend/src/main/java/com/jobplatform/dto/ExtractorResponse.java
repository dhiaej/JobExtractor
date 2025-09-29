package com.jobplatform.dto;

import java.util.List;
import java.util.Map;

public class ExtractorResponse {
    
    private String fingerprint;
    private List<Double> embedding;
    private String rawText;
    private String language;
    private JobTitle jobTitle;
    private Company company;
    private Location location;
    private List<String> contractType;
    private String type;
    private List<String> salary;
    private List<String> duration;
    private List<String> deadline;
    private Contacts contacts;
    private List<Skill> skills;
    private String inferredDomain;
    private Map<String, Object> metadata;
    
    // Nested classes for structured data
    public static class JobTitle {
        private String value;
        private Double confidence;
        
        public JobTitle() {}
        
        public JobTitle(String value, Double confidence) {
            this.value = value;
            this.confidence = confidence;
        }
        
        public String getValue() {
            return value;
        }
        
        public void setValue(String value) {
            this.value = value;
        }
        
        public Double getConfidence() {
            return confidence;
        }
        
        public void setConfidence(Double confidence) {
            this.confidence = confidence;
        }
    }
    
    public static class Company {
        private String value;
        private Double confidence;
        
        public Company() {}
        
        public Company(String value, Double confidence) {
            this.value = value;
            this.confidence = confidence;
        }
        
        public String getValue() {
            return value;
        }
        
        public void setValue(String value) {
            this.value = value;
        }
        
        public Double getConfidence() {
            return confidence;
        }
        
        public void setConfidence(Double confidence) {
            this.confidence = confidence;
        }
    }
    
    public static class Location {
        private List<String> value;
        private Double confidence;
        
        public Location() {}
        
        public Location(List<String> value, Double confidence) {
            this.value = value;
            this.confidence = confidence;
        }
        
        public List<String> getValue() {
            return value;
        }
        
        public void setValue(List<String> value) {
            this.value = value;
        }
        
        public Double getConfidence() {
            return confidence;
        }
        
        public void setConfidence(Double confidence) {
            this.confidence = confidence;
        }
    }
    
    public static class Contacts {
        private List<String> emails;
        private List<String> urls;
        private List<String> phones;
        
        public Contacts() {}
        
        public Contacts(List<String> emails, List<String> urls, List<String> phones) {
            this.emails = emails;
            this.urls = urls;
            this.phones = phones;
        }
        
        public List<String> getEmails() {
            return emails;
        }
        
        public void setEmails(List<String> emails) {
            this.emails = emails;
        }
        
        public List<String> getUrls() {
            return urls;
        }
        
        public void setUrls(List<String> urls) {
            this.urls = urls;
        }
        
        public List<String> getPhones() {
            return phones;
        }
        
        public void setPhones(List<String> phones) {
            this.phones = phones;
        }
    }
    
    public static class Skill {
        private String skill;
        private Double confidence;
        private String label;
        
        public Skill() {}
        
        public Skill(String skill, Double confidence) {
            this.skill = skill;
            this.confidence = confidence;
        }
        
        public String getSkill() {
            return skill;
        }
        
        public void setSkill(String skill) {
            this.skill = skill;
        }
        
        public Double getConfidence() {
            return confidence;
        }
        
        public void setConfidence(Double confidence) {
            this.confidence = confidence;
        }
        
        public String getLabel() {
            return label;
        }
        
        public void setLabel(String label) {
            this.label = label;
        }
    }
    
    // Constructors
    public ExtractorResponse() {}
    
    // Getters and Setters
    public String getFingerprint() {
        return fingerprint;
    }
    
    public void setFingerprint(String fingerprint) {
        this.fingerprint = fingerprint;
    }
    
    public List<Double> getEmbedding() {
        return embedding;
    }
    
    public void setEmbedding(List<Double> embedding) {
        this.embedding = embedding;
    }
    
    public String getRawText() {
        return rawText;
    }
    
    public void setRawText(String rawText) {
        this.rawText = rawText;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public JobTitle getJobTitle() {
        return jobTitle;
    }
    
    public void setJobTitle(JobTitle jobTitle) {
        this.jobTitle = jobTitle;
    }
    
    public Company getCompany() {
        return company;
    }
    
    public void setCompany(Company company) {
        this.company = company;
    }
    
    public Location getLocation() {
        return location;
    }
    
    public void setLocation(Location location) {
        this.location = location;
    }
    
    public List<String> getContractType() {
        return contractType;
    }
    
    public void setContractType(List<String> contractType) {
        this.contractType = contractType;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public List<String> getSalary() {
        return salary;
    }
    
    public void setSalary(List<String> salary) {
        this.salary = salary;
    }
    
    public List<String> getDuration() {
        return duration;
    }
    
    public void setDuration(List<String> duration) {
        this.duration = duration;
    }
    
    public List<String> getDeadline() {
        return deadline;
    }
    
    public void setDeadline(List<String> deadline) {
        this.deadline = deadline;
    }
    
    public Contacts getContacts() {
        return contacts;
    }
    
    public void setContacts(Contacts contacts) {
        this.contacts = contacts;
    }
    
    public List<Skill> getSkills() {
        return skills;
    }
    
    public void setSkills(List<Skill> skills) {
        this.skills = skills;
    }
    
    public String getInferredDomain() {
        return inferredDomain;
    }
    
    public void setInferredDomain(String inferredDomain) {
        this.inferredDomain = inferredDomain;
    }
    
    public Map<String, Object> getMetadata() {
        return metadata;
    }
    
    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
}
