package click.badcourt.be.repository;

import click.badcourt.be.entity.Booking;
import click.badcourt.be.entity.BookingDetail;
import click.badcourt.be.enums.BookingDetailStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.Date;
import java.util.List;

@Repository
public interface BookingDetailRepository extends JpaRepository<BookingDetail,Long> {
    //    @Query("SELECT bd FROM BookingDetail bd WHERE bd.date >= :startDate AND bd.date <= :endDate AND bd.deleted = false")
    //    List<BookingDetail> findBookingDetailsByDateRangeAndDeletedFalse(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
    //    @Query("SELECT bd FROM BookingDetail bd WHERE bd.date = :date AND bd.deleted = false")
    //    List<BookingDetail> findBookingDetailsByDateAndDeletedFalse(@Param("date") Date date);
    List<BookingDetail> findBookingDetailsByBooking_BookingId(Long bookingId);
    List<BookingDetail> findBookingDetailsByDeletedFalse();
    int countBookingDetailsByBooking(Booking booking);
    int countBookingDetailsByDetailStatus_AndBooking_BookingId(BookingDetailStatusEnum bookingDetailStatusEnum, Long bookingId);
    List<BookingDetail> findBookingDetailsByDeletedTrueAndCourtTimeslot_CourtTSlotID(Long courtTSlotID);
    List<BookingDetail> findBookingDetailsByCourtTimeslot_CourtTSlotID(Long courtTSlotID);
    @Query(value = "SELECT DAYOFWEEK(date) AS dayOfWeek, COUNT(*) FROM booking_detail WHERE deleted = false GROUP BY dayOfWeek", nativeQuery = true)
    List<Object[]> countBookingsByDayOfWeek();
    List<BookingDetail> findByDetailStatusAndDateBeforeAndCourtTimeslot_Timeslot_EndTimeBefore(BookingDetailStatusEnum status, Date date, LocalTime time);
    @Query(value = "SELECT bd.* FROM booking_detail bd " +
            "JOIN booking b ON bd.from_booking = b.booking_id " +
            "WHERE DATE(bd.date) = DATE(:date) AND b.status != 'CANCELED'", nativeQuery = true)
    List<BookingDetail> findBookingDetailsForTomorrow(Date date);
    @Query(value= "SELECT bd FROM BookingDetail bd " +
            "JOIN bd.booking b " +
            "WHERE b.status = 'COMPLETED' AND bd.date < :date " +
            "ORDER BY bd.date ASC", nativeQuery = true)
    List<BookingDetail> findCompletedBookingsBeforeDate(Date date);

}
