package com.example.tuition.repository;

import com.example.tuition.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
   Optional<User> findByUsernameIgnoreCase(String username);
}
