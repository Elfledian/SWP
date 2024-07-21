package click.badcourt.be.api;

import click.badcourt.be.model.request.BookingDetailRequest;
import click.badcourt.be.model.request.ChangeSlotBookingDetailRequestCombo;
import click.badcourt.be.model.request.FixedBookingDetailRequest;
import click.badcourt.be.model.response.BookingDetailResponse;
import click.badcourt.be.model.response.BookingDetailsCustomerResponse;
import click.badcourt.be.model.response.ChangeSlotBookingDetailResponseCombo;
import click.badcourt.be.service.BookingDetailService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookingDetail")
@SecurityRequirement(name = "api")
public class BookingDetailApi {

    @Autowired
    BookingDetailService bookingDetailService;


    @GetMapping
    public ResponseEntity getAllBookingDetail() {
        return ResponseEntity.ok(bookingDetailService.getAllBookingDetails());
    }

    @GetMapping("/qrcheck/{bookingid}")
    public ResponseEntity getBookingDetailByIdQrCheck(@PathVariable Long bookingid) throws Exception {
        return ResponseEntity.ok(bookingDetailService.getBookingDetailByBookingIdQrCheck(bookingid));
    }

    @GetMapping("/{bookingid}")
    public ResponseEntity getBookingDetailById(@PathVariable Long bookingid) {
        return ResponseEntity.ok(bookingDetailService.getBookingDetailByBookingId(bookingid));
    }

    @GetMapping("/{courtId}/{date}")
    public ResponseEntity getBookingDetailById(@PathVariable Long courtId, @PathVariable @DateTimeFormat(pattern="yyyy-MM-dd") Date date) {
        return ResponseEntity.ok(bookingDetailService.getBookingDetailByCourtId(courtId, date));
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
    @GetMapping("/customer-history/{id}")
    public ResponseEntity<List<BookingDetailsCustomerResponse>> getBookingBookingDetailByBookingId(@PathVariable Long id) {
        try {
            List<BookingDetailsCustomerResponse> bookingDetailsCustomerResponses = bookingDetailService.getBookingCustomerBookingDetailByBookingId(id);
            return ResponseEntity.ok(bookingDetailsCustomerResponses);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @PostMapping
    public ResponseEntity createBookingDetail(@RequestBody BookingDetailRequest bookingDetailRequest) {
        try{
            BookingDetailRequest createBookingDetail = bookingDetailService.createBookingDetail(bookingDetailRequest);
            return new ResponseEntity<>(createBookingDetail, HttpStatus.CREATED);
        }catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    @PutMapping("/checkin/{id}")
    public ResponseEntity checkinBookingDetail(@PathVariable Long id) {
        try{
            bookingDetailService.checkin(id);
            return new ResponseEntity<>("Checkin Successfully !", HttpStatus.CREATED);
        }catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity updateBookingDetail(@RequestBody BookingDetailRequest bookingDetailRequest, @PathVariable Long id) {
        try {
            BookingDetailRequest updateBookingDetail = bookingDetailService.updateBookingDetail(bookingDetailRequest, id);
            BookingDetailResponse bookingDetailResponse = new BookingDetailResponse();
            bookingDetailResponse.setBookingDate(updateBookingDetail.getBookingDate());
            bookingDetailResponse.setCourtTSId(updateBookingDetail.getCourtTSId());
            bookingDetailResponse.setBookingId(updateBookingDetail.getBookingId());
            return ResponseEntity.ok(bookingDetailResponse);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    @PutMapping("/slot/{bookingDetailId}")
    public ChangeSlotBookingDetailResponseCombo changeSlotBookingDetailResponseCombo(@RequestBody ChangeSlotBookingDetailRequestCombo changeSlotBookingDetailRequestCombo, @PathVariable Long bookingDetailId){
        ChangeSlotBookingDetailResponseCombo changeSlotBookingDetailResponseCombo = bookingDetailService.changeSlotBookingDetail(changeSlotBookingDetailRequestCombo, bookingDetailId);
        return changeSlotBookingDetailResponseCombo;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteBookingDetailById(@PathVariable Long id) {
        bookingDetailService.deleteBookingDetail(id);
        return ResponseEntity.ok( "BookingDetail  :"+id +" is deleted");
    }
    @GetMapping("/report")
    public Map<String, Integer> getBookingsReport() {
        return bookingDetailService.getBookingsCountByDayOfWeek();
    }
}
