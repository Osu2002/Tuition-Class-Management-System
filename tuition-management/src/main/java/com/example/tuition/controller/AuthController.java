package com.example.tuition.controller;

import com.example.tuition.model.User;
import com.example.tuition.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
String uname = (user.getUsername() == null ? "" : user.getUsername().trim());
    user.setUsername(uname);
   if (userService.findByUsername(uname) != null) {            return ResponseEntity.badRequest().body("Username already exists");
        }
        user.setRole("ADMIN");
        return ResponseEntity.ok(userService.registerUser(user));
    }
}
