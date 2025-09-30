package com.example.tuition.repository;

import com.example.tuition.model.TuitionClass;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TuitionClassRepository extends MongoRepository<TuitionClass, String> {
    // Custom query methods can be added here
}
