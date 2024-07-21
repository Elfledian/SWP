package click.badcourt.be.api;

import click.badcourt.be.enums.BookingStatusEnum;
import click.badcourt.be.model.request.*;
import click.badcourt.be.model.response.BookingComboResponse;
import click.badcourt.be.model.response.BookingDetailResponse;
import click.badcourt.be.model.response.BookingResponse;
import click.badcourt.be.model.response.BookingResponseFeedbackYN;
import click.badcourt.be.repository.BookingDetailRepository;
import click.badcourt.be.repository.BookingRepository;
import click.badcourt.be.service.BookingDetailService;
import click.badcourt.be.service.BookingService;
import click.badcourt.be.service.EmailService;
import com.google.zxing.NotFoundException;
import com.google.zxing.WriterException;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/booking")
@SecurityRequirement(name = "api")
@CrossOrigin("*")
public class BookingApi {
    @Autowired
    private BookingService bookingService;
    @Autowired
    private BookingDetailService bookingDetailService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private BookingDetailRepository bookingDetailRepository;
    @Autowired
    private BookingRepository bookingRepository;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@RequestBody BookingCreateRequest bookingCreateRequest) {
        BookingResponse booking = bookingService.createBooking(bookingCreateRequest);
        return ResponseEntity.ok(booking);
    }
    @GetMapping("/countByClubOwner")
    public ResponseEntity<?> countBookingsByClubOwner() {
        try {
            long bookingCount = bookingService.countBookingsByClubOwner();
            return ResponseEntity.ok(bookingCount);
        } catch (SecurityException e) {

            return new ResponseEntity<>(e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/getBookings")
    public ResponseEntity<?> getBookingsByClubId() {
        try {

            List<BookingResponse> bookings = bookingService.getAllBookingsByClubId();
            return ResponseEntity.ok(bookings);
        } catch (IllegalArgumentException e) {

            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok("bookingID :"+id +" is canceled");
    }

    @PostMapping("/fixed")
    public ResponseEntity createFixedBooking(@RequestBody FixedBookingDetailRequest fixedBookingDetailRequest) {
        try {
            List<BookingDetailResponse> fixedBookings = bookingDetailService.createFixedBookings(fixedBookingDetailRequest);
            return new ResponseEntity<>(fixedBookings, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/bookingCombo")
    public ResponseEntity<BookingComboResponse> createBookingCombo(@RequestBody BookingComboRequest bookingComboRequest) {
        try {
            return ResponseEntity.ok(bookingService.createBookingCombo(bookingComboRequest));
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/bookingForStaff")
    public ResponseEntity<BookingComboResponse> createBookingCombo(@RequestBody BookingComboRequestForStaff bookingComboRequest) {
        try {
            return ResponseEntity.ok(bookingService.createBookingForStaff(bookingComboRequest));
        } catch (IllegalArgumentException | MessagingException | IOException | WriterException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(@RequestBody BookingUpdateRequest bookingUpdateRequest, @PathVariable Long id) {
        try {
            BookingResponse bookingResponse = bookingService.updateBooking(bookingUpdateRequest, id);
            return ResponseEntity.ok(bookingResponse);
        }catch (IllegalArgumentException e){
            return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
        }
    }
    @GetMapping("/customer")
    public ResponseEntity<?> getCustomerBookingsWithOptionalFilter(@RequestParam(required = false) Long bookingTypeId) {
        try {
            List<BookingResponseFeedbackYN> bookingResponses = bookingService.getCustomerBookingsWithOptionalFilter(bookingTypeId);

            return ResponseEntity.ok(bookingResponses);
        } catch (IllegalArgumentException e) {
            // Log the exception details

            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }




    @PostMapping("/confirm")
    public String confirmBooking(@RequestBody QRCodeData data,@RequestParam String email) {
        try {
            bookingService.sendBookingConfirmation(data,email);
            return "Booking confirmation sent!";
        } catch (WriterException | IOException | MessagingException e) {
            e.printStackTrace();
            return "Failed to send booking confirmation.";
        }
    }

    @PostMapping("/checkin")
    public String checkIn(@RequestParam byte[] qrCodeData, @RequestBody QRCodeData expectedData) {
        try {
            boolean isValid = bookingService.validateQrCode(qrCodeData, expectedData);
            return isValid ? "Check-in successful!" : "Invalid QR code.";
        } catch (IOException | NotFoundException e) {   
            e.printStackTrace();
            return "Failed to validate QR code.";
        }
    }
    @GetMapping("/status-counts")
    public ResponseEntity<Map<String, Long>> getStatusCounts(@RequestParam Long clubId) {
        return ResponseEntity.ok(bookingService.getBookingStatusCounts(clubId));
    }




//    @DeleteMapping("/{bookingId}")
//    public ResponseEntity<Void> deleteBooking(@PathVariable Long bookingId) {
//        bookingService.deleteBooking(bookingId);
//        return ResponseEntity.noContent().build();
//    }
}
