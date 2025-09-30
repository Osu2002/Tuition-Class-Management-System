package com.example.tuition.service;

import com.example.tuition.model.TuitionClass;
import com.example.tuition.repository.TuitionClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TuitionClassService {
    @Autowired
    private TuitionClassRepository tuitionClassRepository;

    public TuitionClass addClass(TuitionClass tuitionClass) {
        return tuitionClassRepository.save(tuitionClass);
    }

    public List<TuitionClass> getAllClasses() {
        return tuitionClassRepository.findAll();
    }

    public Optional<TuitionClass> getClassById(String id) {
        return tuitionClassRepository.findById(id);
    }

    public TuitionClass updateClass(String id, TuitionClass tuitionClass) {
        tuitionClass.setId(id);
        return tuitionClassRepository.save(tuitionClass);
    }

    public void deleteClass(String id) {
        tuitionClassRepository.deleteById(id);
    }
}
