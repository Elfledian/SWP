package com.example.BadCourts.repository;

import com.example.BadCourts.model.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourtRepository extends JpaRepository<Court, String> {
}
