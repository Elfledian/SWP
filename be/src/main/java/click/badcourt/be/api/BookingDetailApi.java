package click.badcourt.be.api;

import click.badcourt.be.entity.BookingDetail;
import click.badcourt.be.model.request.BookingDetailRequest;
import click.badcourt.be.model.request.FixedBookingDetailRequest;
import click.badcourt.be.model.response.BookingDetailResponse;
import click.badcourt.be.service.BookingDetailService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    @GetMapping("/{id}")
    public ResponseEntity getBookingDetailById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingDetailService.getBookingDetailByBookingId(id));
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
    @PostMapping
    public ResponseEntity createBookingDetail(@RequestBody BookingDetailRequest bookingDetailRequest) {
        try{
            BookingDetailRequest createBookingDetail = bookingDetailService.createBookingDetail(bookingDetailRequest);
            return new ResponseEntity<>(createBookingDetail, HttpStatus.CREATED);
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

    @DeleteMapping("/{id}")
    public ResponseEntity deleteBookingDetailById(@PathVariable Long id) {
        bookingDetailService.deleteBookingDetail(id);
        return ResponseEntity.ok( "BookingDetail  :"+id +" is deleted");
    }
}
