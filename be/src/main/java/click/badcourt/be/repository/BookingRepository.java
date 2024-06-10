package click.badcourt.be.repository;

import click.badcourt.be.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking,Long> {

    List<Booking> findBookingsByCourt_CourtId(Long courtId);

}
