package click.badcourt.be.repository;

import click.badcourt.be.entity.Court_timeslot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface CourtTimeSlotRepository extends JpaRepository<Court_timeslot, Long> {


    List<Court_timeslot> findCourt_timeslotByDeletedFalseAndCourt_CourtId(int court_id);


}