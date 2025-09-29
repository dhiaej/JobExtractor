package com.jobplatform.repository;

import com.jobplatform.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    // Find applications by seeker
    List<Application> findBySeekerId(Long seekerId);
    
    // Find applications by seeker with pagination
    Page<Application> findBySeekerId(Long seekerId, Pageable pageable);
    
    // Find applications by job offer
    List<Application> findByJobOfferId(Long jobOfferId);
    
    // Find applications by job offer with pagination
    Page<Application> findByJobOfferId(Long jobOfferId, Pageable pageable);
    
    // Find applications by job offerer (through job offers)
    @Query("SELECT a FROM Application a WHERE a.jobOffer.offerer.id = :offererId")
    List<Application> findByOffererId(@Param("offererId") Long offererId);
    
    // Find applications by job offerer with pagination
    @Query("SELECT a FROM Application a WHERE a.jobOffer.offerer.id = :offererId")
    Page<Application> findByOffererId(@Param("offererId") Long offererId, Pageable pageable);
    
    // Find applications by status
    List<Application> findByStatus(Application.ApplicationStatus status);
    
    // Find applications by seeker and status
    List<Application> findBySeekerIdAndStatus(Long seekerId, Application.ApplicationStatus status);
    
    // Find applications by job offer and status
    List<Application> findByJobOfferIdAndStatus(Long jobOfferId, Application.ApplicationStatus status);
    
    // Check if seeker already applied to a job offer
    Optional<Application> findBySeekerIdAndJobOfferId(Long seekerId, Long jobOfferId);
    
    // Get application statistics
    @Query("SELECT COUNT(a) FROM Application a WHERE a.seeker.id = :seekerId")
    Long countApplicationsBySeeker(@Param("seekerId") Long seekerId);
    
    @Query("SELECT COUNT(a) FROM Application a WHERE a.jobOffer.offerer.id = :offererId")
    Long countApplicationsByOfferer(@Param("offererId") Long offererId);
    
    @Query("SELECT COUNT(a) FROM Application a WHERE a.jobOffer.id = :jobOfferId")
    Long countApplicationsByJobOffer(@Param("jobOfferId") Long jobOfferId);
    
    @Query("SELECT a.status, COUNT(a) FROM Application a GROUP BY a.status")
    List<Object[]> getApplicationStatusCounts();
    
    // Get applications by status with pagination
    Page<Application> findByStatus(Application.ApplicationStatus status, Pageable pageable);
    
    // Get applications by seeker and status with pagination
    Page<Application> findBySeekerIdAndStatus(Long seekerId, Application.ApplicationStatus status, Pageable pageable);
    
    // Get applications by job offer and status with pagination
    Page<Application> findByJobOfferIdAndStatus(Long jobOfferId, Application.ApplicationStatus status, Pageable pageable);
}
