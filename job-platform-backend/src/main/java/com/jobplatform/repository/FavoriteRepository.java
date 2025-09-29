package com.jobplatform.repository;

import com.jobplatform.entity.Favorite;
import com.jobplatform.entity.JobOffer;
import com.jobplatform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    
    List<Favorite> findBySeeker(User seeker);
    
    List<Favorite> findBySeekerId(Long seekerId);
    
    Optional<Favorite> findBySeekerAndJobOffer(User seeker, JobOffer jobOffer);
    
    boolean existsBySeekerIdAndJobOfferId(Long seekerId, Long jobOfferId);
    
    void deleteBySeekerAndJobOffer(User seeker, JobOffer jobOffer);
}
