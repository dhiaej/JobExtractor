package com.jobplatform.repository;

import com.jobplatform.entity.JobOffer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    
    // Find job offers by offerer
    List<JobOffer> findByOffererId(Long offererId);
    
    // Find active job offers
    List<JobOffer> findByIsActiveTrue();
    
    // Find job offers by offerer with pagination
    Page<JobOffer> findByOffererId(Long offererId, Pageable pageable);
    
    // Find active job offers with pagination
    Page<JobOffer> findByIsActiveTrue(Pageable pageable);
    
    // Search job offers by title, company, or description
    @Query("SELECT j FROM JobOffer j WHERE j.isActive = true AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.company) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<JobOffer> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    // Filter job offers by domain
    @Query("SELECT j FROM JobOffer j WHERE j.isActive = true AND " +
           "LOWER(j.domain) LIKE LOWER(CONCAT('%', :domain, '%'))")
    Page<JobOffer> findByDomain(@Param("domain") String domain, Pageable pageable);
    
    // Filter job offers by contract type
    @Query("SELECT j FROM JobOffer j WHERE j.isActive = true AND " +
           "LOWER(j.contractType) LIKE LOWER(CONCAT('%', :contractType, '%'))")
    Page<JobOffer> findByContractType(@Param("contractType") String contractType, Pageable pageable);
    
    // Filter job offers by location
    @Query("SELECT j FROM JobOffer j WHERE j.isActive = true AND " +
           "LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))")
    Page<JobOffer> findByLocation(@Param("location") String location, Pageable pageable);
    
    // Complex search with multiple filters
    @Query("SELECT j FROM JobOffer j WHERE j.isActive = true AND " +
           "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.company) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:domain IS NULL OR LOWER(j.domain) LIKE LOWER(CONCAT('%', :domain, '%'))) AND " +
           "(:contractType IS NULL OR LOWER(j.contractType) LIKE LOWER(CONCAT('%', :contractType, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))")
    Page<JobOffer> searchWithFilters(@Param("keyword") String keyword, 
                                    @Param("domain") String domain,
                                    @Param("contractType") String contractType,
                                    @Param("location") String location,
                                    Pageable pageable);
    
    // Get job offers by type (Job or Internship)
    @Query("SELECT j FROM JobOffer j WHERE j.isActive = true AND j.type = :type")
    Page<JobOffer> findByType(@Param("type") String type, Pageable pageable);
    
    // Get statistics
    @Query("SELECT COUNT(j) FROM JobOffer j WHERE j.isActive = true")
    Long countActiveJobOffers();
    
    @Query("SELECT COUNT(j) FROM JobOffer j WHERE j.offerer.id = :offererId AND j.isActive = true")
    Long countActiveJobOffersByOfferer(@Param("offererId") Long offererId);
    
    // Get top domains
    @Query("SELECT j.domain, COUNT(j) FROM JobOffer j WHERE j.isActive = true AND j.domain IS NOT NULL GROUP BY j.domain ORDER BY COUNT(j) DESC")
    List<Object[]> getTopDomains();
    
    // Get top contract types
    @Query("SELECT j.contractType, COUNT(j) FROM JobOffer j WHERE j.isActive = true AND j.contractType IS NOT NULL GROUP BY j.contractType ORDER BY COUNT(j) DESC")
    List<Object[]> getTopContractTypes();
    
    // Get top locations
    @Query("SELECT j.location, COUNT(j) FROM JobOffer j WHERE j.isActive = true AND j.location IS NOT NULL GROUP BY j.location ORDER BY COUNT(j) DESC")
    List<Object[]> getTopLocations();
    
    // Count by domain for admin stats
    @Query("SELECT j.domain, COUNT(j) FROM JobOffer j WHERE j.isActive = true AND j.domain IS NOT NULL GROUP BY j.domain ORDER BY COUNT(j) DESC")
    List<Object[]> countByDomain();
}
