package com.ecoquest.repository;

import com.ecoquest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByVerificationToken(String token);
    List<User> findByRoleOrderByXpDesc(User.Role role);
    List<User> findByRoleAndClassNameOrderByXpDesc(User.Role role, String className);
}
