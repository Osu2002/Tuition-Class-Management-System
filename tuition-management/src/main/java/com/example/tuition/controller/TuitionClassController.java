package com.example.tuition.controller;

import com.example.tuition.model.TuitionClass;
import com.example.tuition.service.TuitionClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/classes")
public class TuitionClassController {
    @Autowired
    private TuitionClassService tuitionClassService;

    @PostMapping
    public ResponseEntity<TuitionClass> addClass(@RequestBody TuitionClass tuitionClass) {
        return ResponseEntity.ok(tuitionClassService.addClass(tuitionClass));
    }

    @GetMapping
    public ResponseEntity<List<TuitionClass>> getAllClasses() {
        return ResponseEntity.ok(tuitionClassService.getAllClasses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TuitionClass> getClassById(@PathVariable String id) {
        return tuitionClassService.getClassById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TuitionClass> updateClass(@PathVariable String id, @RequestBody TuitionClass tuitionClass) {
        return ResponseEntity.ok(tuitionClassService.updateClass(id, tuitionClass));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClass(@PathVariable String id) {
        tuitionClassService.deleteClass(id);
        return ResponseEntity.ok().build();
    }
}
