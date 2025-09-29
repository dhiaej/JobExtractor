package com.jobplatform.repository;

import com.jobplatform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByEmailAndPassword(String email, String password);
    
    List<User> findByRole(User.Role role);
    
    List<User> findByActive(Boolean active);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    Long countByRole(@Param("role") User.Role role);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.active = :active")
    Long countByActive(@Param("active") Boolean active);
    
    @Query("SELECT COUNT(u) FROM User u")
    Long countAllUsers();
}
