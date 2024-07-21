package click.badcourt.be.repository;

import click.badcourt.be.entity.Booking;
import click.badcourt.be.enums.BookingStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking,Long> {

    List<Booking> findBookingsByClub_ClubId(Long clubID);


    List<Booking> findAllByAccount_AccountId(Long accountId);
    List<Booking> findByStatusAndBookingDateBefore(BookingStatusEnum status, Date date);
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.club.clubId = :clubId AND b.status = :status")
    long countByClubIdAndStatus(@Param("clubId") Long clubId, @Param("status") BookingStatusEnum status);
    @Query("SELECT b FROM Booking b WHERE b.status = 'COMPLETED'")
    List<Booking> findCompletedBookings();

}
