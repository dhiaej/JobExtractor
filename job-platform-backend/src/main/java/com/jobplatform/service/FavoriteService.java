package com.jobplatform.service;

import com.jobplatform.dto.FavoriteDto;
import com.jobplatform.entity.Favorite;
import com.jobplatform.entity.JobOffer;
import com.jobplatform.entity.User;
import com.jobplatform.repository.FavoriteRepository;
import com.jobplatform.repository.JobOfferRepository;
import com.jobplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class FavoriteService {
    
    @Autowired
    private FavoriteRepository favoriteRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JobOfferRepository jobOfferRepository;
    
    public FavoriteDto addFavorite(Long seekerId, Long jobOfferId) {
        Optional<User> seekerOpt = userRepository.findById(seekerId);
        if (seekerOpt.isEmpty()) {
            throw new RuntimeException("Seeker not found");
        }
        
        Optional<JobOffer> jobOfferOpt = jobOfferRepository.findById(jobOfferId);
        if (jobOfferOpt.isEmpty()) {
            throw new RuntimeException("Job offer not found");
        }
        
        User seeker = seekerOpt.get();
        JobOffer jobOffer = jobOfferOpt.get();
        
        // Check if already favorited
        if (favoriteRepository.existsBySeekerIdAndJobOfferId(seekerId, jobOfferId)) {
            throw new RuntimeException("Job offer already in favorites");
        }
        
        Favorite favorite = new Favorite(seeker, jobOffer);
        Favorite savedFavorite = favoriteRepository.save(favorite);
        return convertToDto(savedFavorite);
    }
    
    public List<FavoriteDto> getFavoritesBySeeker(Long seekerId) {
        List<Favorite> favorites = favoriteRepository.findBySeekerId(seekerId);
        return favorites.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public void removeFavorite(Long favoriteId, Long seekerId) {
        Optional<Favorite> favoriteOpt = favoriteRepository.findById(favoriteId);
        if (favoriteOpt.isEmpty()) {
            throw new RuntimeException("Favorite not found");
        }
        
        Favorite favorite = favoriteOpt.get();
        if (!favorite.getSeeker().getId().equals(seekerId)) {
            throw new RuntimeException("You can only remove your own favorites");
        }
        
        favoriteRepository.delete(favorite);
    }
    
    public void removeFavoriteByJobOffer(Long seekerId, Long jobOfferId) {
        Optional<User> seekerOpt = userRepository.findById(seekerId);
        if (seekerOpt.isEmpty()) {
            throw new RuntimeException("Seeker not found");
        }
        
        Optional<JobOffer> jobOfferOpt = jobOfferRepository.findById(jobOfferId);
        if (jobOfferOpt.isEmpty()) {
            throw new RuntimeException("Job offer not found");
        }
        
        User seeker = seekerOpt.get();
        JobOffer jobOffer = jobOfferOpt.get();
        
        favoriteRepository.deleteBySeekerAndJobOffer(seeker, jobOffer);
    }
    
    private FavoriteDto convertToDto(Favorite favorite) {
        return new FavoriteDto(
            favorite.getId(),
            favorite.getSeeker().getId(),
            favorite.getJobOffer().getId(),
            convertJobOfferToDto(favorite.getJobOffer()),
            LocalDateTime.now() // You might want to add createdAt to Favorite entity
        );
    }
    
    private com.jobplatform.dto.JobOfferDto convertJobOfferToDto(JobOffer jobOffer) {
        return new com.jobplatform.dto.JobOfferDto(jobOffer);
    }
}
