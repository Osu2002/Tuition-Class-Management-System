package com.example.tuition.service;

import com.example.tuition.model.User;
import com.example.tuition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// ✅ ADD THIS import:
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    // ✅ Use the interface, not the concrete BCrypt class
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User findByUsername(String username) {
     return userRepository.findByUsernameIgnoreCase(username).orElse(null);
}
}
