package click.badcourt.be.api;

import click.badcourt.be.entity.Booking;
import click.badcourt.be.entity.Transaction;
import click.badcourt.be.model.request.*;
import click.badcourt.be.model.response.BookingComboResponse;
import click.badcourt.be.model.response.BookingResponse;
import click.badcourt.be.model.response.TransactionResponseDTO;
import click.badcourt.be.repository.BookingDetailRepository;
import click.badcourt.be.repository.BookingRepository;
import click.badcourt.be.service.BookingDetailService;
import click.badcourt.be.service.BookingService;
import click.badcourt.be.service.TransactionService;
import click.badcourt.be.service.WalletService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pay")
@SecurityRequirement(name = "api")
public class WalletApi {

    @Autowired
    WalletService walletService;

    @Autowired
    BookingService bookingService;

    @Autowired
    BookingDetailService bookingDetailService;

    @Autowired
    BookingDetailRepository bookingDetailRepository;

    @Autowired
    private TransactionService transactionService;
    @Autowired
    private BookingRepository bookingRepository;
    @PostMapping("/withDraw")
    public ResponseEntity<String> withDraw(@RequestBody double amount) {
        try {
            Transaction transaction = walletService.withDraw(amount);
            return ResponseEntity.ok("Withdrawal successful.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/requestsWithDraw")
    public ResponseEntity<List<TransactionResponseDTO>> requestWithDraw() {
        List<TransactionResponseDTO> transactions = walletService.requestWithDraw();
        return ResponseEntity.ok(transactions);
    }

    @PutMapping("/acceptWithDraw")
    public ResponseEntity<String> acpWithDraw(@RequestParam Long id) {
        try {
            Transaction transaction = walletService.acpWithDraw(id);
            return ResponseEntity.ok("Withdrawal accepted.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/rejectWithDraw")
    public ResponseEntity<String> rejectWithDraw(@RequestParam Long id, @RequestParam("reason") String reason) {
        try {
            Transaction transaction = walletService.rejectWithDraw(id, reason);
            return ResponseEntity.ok("Withdrawal rejected.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    @PostMapping("/request-recharge-vnpay")
    public ResponseEntity createRechargeUrl(@RequestBody WalletRechargeDTO rechargeRequestDTO) throws Exception {
        String url= walletService.createUrlRecharge(rechargeRequestDTO);
        return ResponseEntity.ok(url);
    }
    @PostMapping()
    public ResponseEntity createUrl(@RequestBody RechargeRequestDTO rechargeRequestDTO) throws Exception {
        String url= walletService.createUrl(rechargeRequestDTO);
        return ResponseEntity.ok(url);
    }
    @GetMapping("/params")
    public ResponseEntity getUrlParams(@RequestParam String url) throws Exception {
        Map<String, String> params = walletService.getUrlParameters(url);
        return ResponseEntity.ok(params);
    }

    @PostMapping("/combo")
    public ResponseEntity createUrlCombo(@RequestBody RechargeRequestDTOCombo rechargeRequestDTOCombo) throws Exception {

        BookingResponse bkcr = bookingService.createBookingNew(rechargeRequestDTOCombo.getClub_id(), rechargeRequestDTOCombo.getBooking_type_id());
        Booking booking = bookingRepository.findById(bkcr.getId()).orElseThrow(() -> new RuntimeException("Booking not found"));
        BookingComboResponse bookingComboResponse = new BookingComboResponse();
        bookingComboResponse.setBookingResponse(bkcr);
        List<BookingDetailRequestCombo> bkdtrspl = rechargeRequestDTOCombo.getBookingDetailRequestCombos();
        List<BookingDetailRequest> returnlist = new ArrayList<>();
        BookingDetailRequest store;
        Long id = bkcr.getId();
        if (bkcr.getBookingTypeId() == 1) {
            for (BookingDetailRequestCombo bkdtr : bkdtrspl) {
                store = bookingDetailService.create1stBookingDetailCombo(bkdtr, id);
                returnlist.add(store);
            }
        } else if (bkcr.getBookingTypeId() == 2) {
            List<BookingDetailRequest> returnlistAdd = new ArrayList<>();
            for (BookingDetailRequestCombo bkdtr : bkdtrspl) {
                returnlistAdd = bookingDetailService.createFixedBookingDetailCombos(bkdtr, id);
                returnlist.addAll(returnlistAdd);
            }
        } else if (bkcr.getBookingTypeId() == 3) {
            for (BookingDetailRequestCombo bkdtr : bkdtrspl) {
                store = bookingDetailService.create3rdBookingDetailCombo(bkdtr, id);
                returnlist.add(store);
            }
        }
        bookingComboResponse.setBookingDetailRequestList(returnlist);
        RechargeRequestDTO requestDTO = new RechargeRequestDTO();
        requestDTO.setBookingId(bkcr.getId());
        String ammountt = transactionService.getPredictedPriceByGivenInfoCombo(rechargeRequestDTOCombo.getClub_id(), bkcr.getBookingTypeId(), bookingDetailRepository.countBookingDetailsByBooking(booking)).toString();
        requestDTO.setAmount(ammountt);
        String url = walletService.createUrl(requestDTO);
        return ResponseEntity.ok(url);
    }
}
