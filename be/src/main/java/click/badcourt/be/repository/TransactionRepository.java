package click.badcourt.be.repository;

import click.badcourt.be.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByBooking_BookingId(Long bookingId);
    @Query(value = "SELECT SUM(t.total_amount) FROM transaction t JOIN booking b ON t.booking_id = b.booking_id WHERE YEAR(t.payment_date) = ?1 AND MONTH(t.payment_date) = ?2 AND b.clubid = ?3 AND t.status = 'FULLY_PAID'", nativeQuery = true)
    Double calculateMonthlyRevenueByClub(int year, int month, Long clubId);

    @Query(value = "SELECT SUM(t.total_amount) FROM transaction t JOIN booking b ON t.booking_id = b.booking_id WHERE YEAR(t.payment_date) = ?1 AND b.clubid = ?2 AND t.status = 'FULLY_PAID'", nativeQuery = true)
    Double calculateYearlyRevenueByClub(int year, Long clubId);

    @Query("SELECT MONTH(t.paymentDate), SUM(t.totalAmount) " +
            "FROM Transaction t " +
            "WHERE YEAR(t.paymentDate) = ?1 " +
            "GROUP BY MONTH(t.paymentDate)")
    List<Object[]> getTotalAmountByMonth(int year);

    @Query("SELECT MONTH(t.paymentDate), SUM(t.totalAmount) " +
            "FROM Transaction t " +
            "WHERE YEAR(t.paymentDate) = ?1 AND t.booking.club.clubId = ?2 " +
            "GROUP BY MONTH(t.paymentDate)")
    List<Object[]> getTotalAmountByMonthForClub(int year, Long clubId);
}
