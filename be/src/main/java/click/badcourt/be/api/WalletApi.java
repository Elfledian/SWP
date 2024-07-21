package click.badcourt.be.api;

import click.badcourt.be.entity.Booking;
import click.badcourt.be.entity.Transaction;
import click.badcourt.be.model.request.*;
import click.badcourt.be.model.response.BookingComboResponse;
import click.badcourt.be.model.response.BookingResponse;
import click.badcourt.be.model.response.TransactionResponseDTO;
import click.badcourt.be.repository.AuthenticationRepository;
import click.badcourt.be.repository.BookingDetailRepository;
import click.badcourt.be.repository.BookingRepository;
import click.badcourt.be.service.*;
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
    private MomoService momoPaymentService;

    @Autowired
    BookingDetailRepository bookingDetailRepository;
    @Autowired
    AuthenticationRepository authenticationRepository;
    @Autowired
    private TransactionService transactionService;
    @Autowired
    private BookingRepository bookingRepository;
    @PostMapping("/withDraw")
    public ResponseEntity<?> withDraw(@RequestParam double amount) {
        try {
            double balance = walletService.withDraw(amount);
            return ResponseEntity.ok(balance);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


    @GetMapping("/getBalance/{accountId}")
    public ResponseEntity<Float> getBalance(@PathVariable Long accountId) {
        try {
            float balance = walletService.getBalance(accountId);
            return new ResponseEntity<>(balance, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

//    @GetMapping("/requestsWithDraw")
//    public ResponseEntity<List<TransactionResponseDTO>> requestWithDraw() {
//        List<TransactionResponseDTO> transactions = walletService.requestWithDraw();
//        return ResponseEntity.ok(transactions);
//    }
//
//    @PutMapping("/acceptWithDraw")
//    public ResponseEntity<String> acpWithDraw(@RequestParam Long id) {
//        try {
//            Transaction transaction = walletService.acpWithDraw(id);
//            return ResponseEntity.ok("Withdrawal accepted.");
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        }
//    }
//
//    @PutMapping("/rejectWithDraw")
//    public ResponseEntity<String> rejectWithDraw(@RequestParam Long id) {
//        try {
//            Transaction transaction = walletService.rejectWithDraw(id);
//            return ResponseEntity.ok("Withdrawal rejected.");
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        }
//    }
    @PostMapping("/request-recharge-vnpay")
    public ResponseEntity createRechargeUrl(@RequestBody WalletRechargeDTO rechargeRequestDTO) throws Exception {
        String url= walletService.createUrlRecharge(rechargeRequestDTO);
        return ResponseEntity.ok(url);
    }
    @Autowired
    private MomoService momoService;
    @PostMapping()
    public ResponseEntity createUrl(@RequestBody RechargeRequestDTO rechargeRequestDTO) throws Exception {
        String url= walletService.createUrl(rechargeRequestDTO);
        return ResponseEntity.ok(url);
    }
    @PostMapping("/momo")
    public ResponseEntity<String> createPayment(@RequestBody PaymentRequest paymentRequest, @RequestBody RechargeRequestDTO rechargeRequestDTO) {
        try {
            String paymentUrl = momoPaymentService.createPaymentUrl(
                    paymentRequest.getAmount(),
                    paymentRequest.getExtraData(), rechargeRequestDTO
            );
            return ResponseEntity.ok(paymentUrl);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
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
