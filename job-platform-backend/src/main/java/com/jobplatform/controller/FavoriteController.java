package com.jobplatform.controller;

import com.jobplatform.dto.FavoriteDto;
import com.jobplatform.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/favorites")
@CrossOrigin(origins = "http://localhost:4200")
public class FavoriteController {
    
    @Autowired
    private FavoriteService favoriteService;
    
    @PostMapping
    public ResponseEntity<?> addFavorite(@RequestParam Long seekerId, 
                                       @RequestParam Long postingId) {
        try {
            FavoriteDto favorite = favoriteService.addFavorite(seekerId, postingId);
            return ResponseEntity.ok(favorite);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/{seekerId}")
    public ResponseEntity<List<FavoriteDto>> getFavorites(@PathVariable Long seekerId) {
        List<FavoriteDto> favorites = favoriteService.getFavoritesBySeeker(seekerId);
        return ResponseEntity.ok(favorites);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeFavorite(@PathVariable Long id, 
                                          @RequestParam Long seekerId) {
        try {
            favoriteService.removeFavorite(id, seekerId);
            return ResponseEntity.ok("Favorite removed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/by-job-offer")
    public ResponseEntity<?> removeFavoriteByJobOffer(@RequestParam Long seekerId, 
                                                     @RequestParam Long jobOfferId) {
        try {
            favoriteService.removeFavoriteByJobOffer(seekerId, jobOfferId);
            return ResponseEntity.ok("Favorite removed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
