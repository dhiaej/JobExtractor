package com.jobplatform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "favorites", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"seeker_id", "job_offer_id"}))
public class Favorite {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seeker_id", nullable = false)
    @NotNull(message = "Seeker is required")
    private User seeker;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_offer_id", nullable = false)
    @NotNull(message = "Job offer is required")
    private JobOffer jobOffer;
    
    // Constructors
    public Favorite() {}
    
    public Favorite(User seeker, JobOffer jobOffer) {
        this.seeker = seeker;
        this.jobOffer = jobOffer;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getSeeker() {
        return seeker;
    }
    
    public void setSeeker(User seeker) {
        this.seeker = seeker;
    }
    
    public JobOffer getJobOffer() {
        return jobOffer;
    }
    
    public void setJobOffer(JobOffer jobOffer) {
        this.jobOffer = jobOffer;
    }
}
