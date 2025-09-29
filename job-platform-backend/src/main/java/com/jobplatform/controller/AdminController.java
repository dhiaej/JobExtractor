package com.jobplatform.controller;

import com.jobplatform.repository.JobOfferRepository;
import com.jobplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JobOfferRepository jobOfferRepository;
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Total users
        Long totalUsers = userRepository.countAllUsers();
        stats.put("totalUsers", totalUsers);
        
        // Active vs inactive users
        Long activeUsers = userRepository.countByActive(true);
        Long inactiveUsers = userRepository.countByActive(false);
        stats.put("activeUsers", activeUsers);
        stats.put("inactiveUsers", inactiveUsers);
        
        // Users by role
        Long offererCount = userRepository.countByRole(com.jobplatform.entity.User.Role.OFFERER);
        Long seekerCount = userRepository.countByRole(com.jobplatform.entity.User.Role.SEEKER);
        Long adminCount = userRepository.countByRole(com.jobplatform.entity.User.Role.ADMIN);
        
        Map<String, Long> usersByRole = new HashMap<>();
        usersByRole.put("OFFERER", offererCount);
        usersByRole.put("SEEKER", seekerCount);
        usersByRole.put("ADMIN", adminCount);
        stats.put("usersByRole", usersByRole);
        
        // Total job offers
        Long totalJobOffers = jobOfferRepository.count();
        stats.put("totalJobOffers", totalJobOffers);
        
        // Job offers by domain
        List<Object[]> jobOffersByDomain = jobOfferRepository.countByDomain();
        Map<String, Long> domainStats = new HashMap<>();
        for (Object[] row : jobOffersByDomain) {
            domainStats.put((String) row[0], (Long) row[1]);
        }
        stats.put("jobOffersByDomain", domainStats);
        
        return ResponseEntity.ok(stats);
    }
}
