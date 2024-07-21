package click.badcourt.be.service;

import click.badcourt.be.entity.*;
import click.badcourt.be.enums.BookingDetailStatusEnum;
import click.badcourt.be.enums.BookingStatusEnum;
import click.badcourt.be.enums.RoleEnum;
import click.badcourt.be.enums.TransactionEnum;
import click.badcourt.be.model.request.*;
import click.badcourt.be.model.response.BookingComboResponse;
import click.badcourt.be.model.response.BookingResponse;
import click.badcourt.be.model.response.BookingResponseFeedbackYN;
import click.badcourt.be.repository.*;
import click.badcourt.be.utils.AccountUtils;
import com.google.zxing.NotFoundException;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.google.zxing.WriterException;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;


import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private AccountUtils accountUtils;
    @Autowired
    private CourtRepository courtRepository;
    @Autowired
    private ClubRepository clubRepository;
    @Autowired
    private AuthenticationRepository authenticationRepository;

    @Autowired
    private BookingDetailService bookingDetailService;

    @Autowired
    private EmailService emailService;
    @Autowired
    private  TransactionRepository transactionRepository;
    @Autowired
    private BookingTypeRepository bookingTypeRepository;
    private QRCodeService qrCodeService;
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    @Autowired
    private BookingDetailRepository bookingDetailRepository;
    @Autowired
    private TransactionService transactionService;

    @Transactional
    @Scheduled(fixedRate = 60000) // Run the method every 60 seconds
    public void cancelPendingBookings() {
        logger.info("Scheduled task started to check and cancel pending bookings.");

        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.HOUR, +6);
        Date oneHourAgo = cal.getTime();

        List<Booking> bookings = bookingRepository.findByStatusAndBookingDateBefore(BookingStatusEnum.PENDING, oneHourAgo);
        for (Booking booking : bookings) {
            booking.setStatus(BookingStatusEnum.CANCELED);
            bookingRepository.save(booking);
            logger.info("Booking with ID {} has been cancelled.", booking.getBookingId());
        }
        logger.info("Scheduled task completed at {}.", oneHourAgo);
    }

    public BookingComboResponse createBookingForStaff(BookingComboRequestForStaff bookingComboRequest) throws MessagingException, IOException, WriterException {
        BookingResponse bookingCreateTemporary = createBookingNew(bookingComboRequest.getClub_id(),bookingComboRequest.getBooking_type_id());
        Optional<Booking> booking = bookingRepository.findById(bookingCreateTemporary.getId());
        booking.get().setStatus(BookingStatusEnum.COMPLETED);
        bookingRepository.save(booking.get());
        BookingComboResponse bookingComboResponse = new BookingComboResponse();
        bookingComboResponse.setBookingResponse(bookingCreateTemporary);
        List<BookingDetailRequestCombo> bookingDetailResponseList = bookingComboRequest.getBookingDetailRequestCombos();
        List<BookingDetailRequest> returnlist = new ArrayList<>();
        BookingDetailRequest store;
        Long id = bookingCreateTemporary.getId();
        for(BookingDetailRequestCombo bkdtr : bookingDetailResponseList) {
            store = bookingDetailService.create3rdBookingDetailCombo(bkdtr, id);
            returnlist.add(store);
        }

        QRCodeData qrCodeData = new QRCodeData();
        qrCodeData.setBookingId(booking.get().getBookingId());
        sendBookingConfirmation(qrCodeData, bookingComboRequest.getEmail());

        bookingComboResponse.setBookingDetailRequestList(returnlist);
        return bookingComboResponse;
    }

    public long countBookingsByClubOwner() {
        Account currentAccount = accountUtils.getCurrentAccount();
        if (currentAccount.getRole() == RoleEnum.CLUB_OWNER) {
            return bookingRepository.findAll().stream()
                    .filter(booking -> booking.getClub().getAccount().equals(currentAccount))
                    .count();
        } else {
            throw new SecurityException("Current account does not have permission to view this information.");
        }
    }



    public BookingResponse updateBooking (BookingUpdateRequest bookingUpdateRequest, Long id){
        Booking booking = bookingRepository.findById(id).orElseThrow(()->new RuntimeException("Booking not found"));

        Club club = clubRepository.findById(bookingUpdateRequest.getClub_id()).orElseThrow(()->new RuntimeException("Club not found"));
        booking.setClub(club);
        booking.setStatus(bookingUpdateRequest.getBookingStatusEnum());

        booking = bookingRepository.save(booking);

        // Create a new BookingResponse and set the fields
        BookingResponse bookingResponse = new BookingResponse();
        bookingResponse.setId(booking.getBookingId());
        bookingResponse.setBookingDate(booking.getBookingDate());
        bookingResponse.setPrice(booking.getClub().getPrice());
        bookingResponse.setClub_name(club.getName()); // Assuming the Court entity has a reference to Club
        bookingResponse.setAccount_email(booking.getAccount().getEmail()); // Assuming the Account entity has an email field
        bookingResponse.setAccount_number(booking.getAccount().getPhone()); // Assuming the Account entity has an accountNumber field
        bookingResponse.setStatus(booking.getStatus());
        bookingResponse.setBookingTypeId(bookingResponse.getBookingTypeId());
        bookingResponse.setAddress(booking.getClub().getAddress());

        return bookingResponse;
    }
    public List<BookingResponseFeedbackYN> getCustomerBookingsWithOptionalFilter(Long bookingTypeId) {
        Long currentCustomerId = accountUtils.getCurrentAccount().getAccountId();
        if (!authenticationRepository.existsById(currentCustomerId)) {
            throw new IllegalArgumentException("Account not found with id: " + currentCustomerId);
        }
        List<Booking> allBookings = bookingRepository.findAll();
        List<BookingResponseFeedbackYN> bookingResponses = new ArrayList<>();
        for (Booking booking : allBookings) {
            if (booking.getAccount().getAccountId().equals(currentCustomerId) &&
                    (bookingTypeId == null || booking.getBookingType().getBookingTypeId().equals(bookingTypeId))) {
                BookingResponseFeedbackYN response = new BookingResponseFeedbackYN();
                response.setBookingDate(booking.getBookingDate());
                response.setAddress(booking.getClub().getAddress());
                response.setId(booking.getBookingId());
                response.setStatus(booking.getStatus());
                response.setClub_name(booking.getClub().getName());
                response.setAccount_number(accountUtils.getCurrentAccount().getPhone());
                response.setAccount_email(booking.getAccount().getEmail());
                response.setBookingTypeId(booking.getBookingType().getBookingTypeId());
                response.setPrice(booking.getClub().getPrice());
                response.setClubId(booking.getClub().getClubId());
                if(bookingDetailRepository.countBookingDetailsByDetailStatus_AndBooking_BookingId(BookingDetailStatusEnum.CHECKEDIN, booking.getBookingId()) > 0) {
                    response.setDisplay(true);
                }else{
                    response.setDisplay(false);
                }
                bookingResponses.add(response);
            }
        }
        return bookingResponses;
    }


    public List<BookingResponse> getAllBookingsByClubId() {

        Account currentAccount = accountUtils.getCurrentAccount();


        if (!currentAccount.getRole().equals(RoleEnum.CLUB_OWNER)) {
            throw new IllegalArgumentException("Current account is not a club owner");
        }


        Long clubId = currentAccount.getClub().getClubId();

        Optional<Club> clubOptional = clubRepository.findById(clubId);
        if (clubOptional.isEmpty()) {
            throw new IllegalArgumentException("Club not found with id: " + clubId);
        }

        List<Booking> allBookings = bookingRepository.findAll();
        List<BookingResponse> bookingResponses = new ArrayList<>();

        for (Booking booking : allBookings) {
            if (booking.getClub().getClubId().equals(clubId)) {
                BookingResponse response = new BookingResponse();
                response.setId(booking.getBookingId());
                response.setBookingDate(booking.getBookingDate());
                response.setPrice(booking.getClub().getPrice());
                response.setClub_name(booking.getClub().getName());
                response.setAccount_email(booking.getAccount().getEmail());
                response.setAccount_number(booking.getAccount().getPhone());
                response.setStatus(booking.getStatus());
                response.setBookingTypeId(booking.getBookingType().getBookingTypeId());
                response.setAddress(booking.getClub().getAddress());
                response.setClubId(booking.getClub().getClubId());

                bookingResponses.add(response);
            }
        }

        return bookingResponses;
    }





    public BookingResponse createBooking(BookingCreateRequest bookingCreateRequest) {
        Booking booking = new Booking();
        Optional<Club> club= clubRepository.findById(bookingCreateRequest.getClub_id());
        Optional<BookingType> bookingType= bookingTypeRepository.findById(bookingCreateRequest.getBooking_type_id());
        if(club.isPresent()&& !club.get().isDeleted()) {

            booking.setBookingDate(bookingCreateRequest.getBookingDate());
            booking.setAccount(accountUtils.getCurrentAccount());
            booking.setClub(club.get());

            booking.setStatus(BookingStatusEnum.PENDING);
            booking.setBookingType(bookingType.get());
            Booking savedBooking= bookingRepository.save(booking);
            BookingResponse response= new BookingResponse();
            response.setId(savedBooking.getBookingId());
            response.setPrice(savedBooking.getClub().getPrice());
            response.setStatus(savedBooking.getStatus());
            response.setAccount_email(savedBooking.getAccount().getEmail());
            response.setAddress(savedBooking.getClub().getAddress());
            response.setAccount_number(accountUtils.getCurrentAccount().getPhone());
            response.setBookingDate(savedBooking.getBookingDate());
            response.setBookingTypeId(savedBooking.getBookingType().getBookingTypeId());
            response.setClub_name(savedBooking.getClub().getName());
            return response;
        }
        else{
            throw new IllegalArgumentException("Account or court not found");
        }
    }

    public BookingResponse createBookingNew(Long clubid, Long bookingTypeId) {
        Booking booking = new Booking();
        Optional<Club> club= clubRepository.findById(clubid);
        Optional<BookingType> bookingType= bookingTypeRepository.findById(bookingTypeId);
        if(club.isPresent()&& !club.get().isDeleted()) {
            Date bookingDate = new Date();
            bookingDate.setHours(bookingDate.getHours()+7);
            booking.setBookingDate(bookingDate);
            booking.setAccount(accountUtils.getCurrentAccount());
            booking.setClub(club.get());

            booking.setStatus(BookingStatusEnum.PENDING);
            booking.setBookingType(bookingType.get());
            Booking savedBooking= bookingRepository.save(booking);
            BookingResponse response= new BookingResponse();
            response.setId(savedBooking.getBookingId());
            response.setPrice(savedBooking.getClub().getPrice());
            response.setStatus(savedBooking.getStatus());
            response.setAccount_email(savedBooking.getAccount().getEmail());
            response.setAddress(savedBooking.getClub().getAddress());
            response.setAccount_number(accountUtils.getCurrentAccount().getPhone());
            response.setBookingDate(savedBooking.getBookingDate());
            response.setBookingTypeId(savedBooking.getBookingType().getBookingTypeId());
            response.setClub_name(savedBooking.getClub().getName());
            response.setClubId(savedBooking.getClub().getClubId());
            return response;
        }
        else{
            throw new IllegalArgumentException("Account or court not found");
        }
    }
    /*public void cancelBooking(Long bookingId){
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatusEnum.CANCELED);
        bookingRepository.save(booking);
    }*/

//    public void cancelBooking(Long bookingId){
//        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
//        booking.setStatus(BookingStatusEnum.CANCELED);
//        List<Transaction> transactions = booking.getTransaction();
//        float refundAmount = 0;
//        Transaction transactionType = new Transaction();
//        for (Transaction transaction: transactions){
//            if (transaction.getStatus() == TransactionEnum.FULLY_PAID) {
//                refundAmount = (float) (transaction.getTotalAmount() * 0.6);
//                transactionType = transaction;
//            }
//        }
//        if (refundAmount > 0) {
//            Account customerAccount = transactionType.getFromaccount();
//            customerAccount.setBalance(customerAccount.getBalance() + refundAmount);
//
//            Account clubOwnerAccount = booking.getClub().getAccount();
//            float clubOwnerRefund = (float) (transactionType.getTotalAmount() * 0.3);
//            clubOwnerAccount.setBalance(clubOwnerAccount.getBalance() + clubOwnerRefund);
//
//            Account toAccount = authenticationRepository.findById(1L).orElseThrow(() -> new RuntimeException("Account not found"));
//            toAccount.setBalance(toAccount.getBalance() - (float)(double)transactionType.getTotalAmount());
//
//            float toAccountRefund = (float)(transactionType.getTotalAmount() * 0.1);
//            toAccount.setBalance(toAccount.getBalance() + toAccountRefund);
//
//            Transaction refundTransaction = new Transaction();
//            refundTransaction.setFromaccount(transactionType.getFromaccount());
//            refundTransaction.setToaccount(transactionType.getToaccount());
//            refundTransaction.setTotalAmount(Double.valueOf(refundAmount));
//            refundTransaction.setBooking(transactionType.getBooking());
//            refundTransaction.setStatus(TransactionEnum.REFUND);
//            refundTransaction.setPaymentDate(new Date());
//
//            transactionRepository.save(refundTransaction);
//            bookingRepository.save(booking);
//            authenticationRepository.save(customerAccount);
//            authenticationRepository.save(clubOwnerAccount);
//            authenticationRepository.save(toAccount);
//            System.out.println("Transaction Status: FULLY_PAID");
//            System.out.println("Refund Amount: " + refundAmount);
//        }
//    }

    public void cancelBooking(Long bookingId){
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatusEnum.CANCELED);
        List<Transaction> transactions = booking.getTransaction();
        float refundAmount = 0;
        Transaction transactionType = new Transaction();
        for (Transaction transaction: transactions){
            if (transaction.getStatus() == TransactionEnum.FULLY_PAID) {
                refundAmount = (float) (transaction.getTotalAmount() * 0.6);
                transactionType = transaction;
            } else if (transaction.getStatus() == TransactionEnum.DEPOSITED) {

                refundAmount = (float) (transaction.getDepositAmount() * 0.6);
                transactionType = transaction;
            }
        }
        if (refundAmount > 0) {
            Account customerAccount = transactionType.getFromaccount();
            Account clubOwnerAccount = booking.getClub().getAccount();
            Account toAccount = authenticationRepository.findById(1L).orElseThrow(() -> new RuntimeException("Account not found"));
//            customerAccount.setBalance(customerAccount.getBalance() + refundAmount);
            transactionService.updateBalanceFromToAmount(toAccount, customerAccount, refundAmount);
            float clubOwnerRefund =transactionType.getStatus() == TransactionEnum.FULLY_PAID ?
                    (float) (transactionType.getTotalAmount() * 0.3) :
                    (float) (transactionType.getDepositAmount() * 0.2);
//            clubOwnerAccount.setBalance(clubOwnerAccount.getBalance() + clubOwnerRefund);
//            toAccount.setBalance(toAccount.getBalance() - (float)(double)transactionType.getTotalAmount());
            transactionService.updateBalanceFromToAmount(toAccount, clubOwnerAccount, clubOwnerRefund);
//            float toAccountRefund = transactionType.getStatus() == TransactionEnum.FULLY_PAID ?
//                    (float)(transactionType.getTotalAmount() * 0.1) :
//                    (float)(transactionType.getDepositAmount() * 0.2);
//            toAccount.setBalance(toAccount.getBalance() + toAccountRefund);

            Transaction refundTransaction = new Transaction();
            refundTransaction.setFromaccount(transactionType.getFromaccount());
            refundTransaction.setToaccount(transactionType.getToaccount());
            refundTransaction.setTotalAmount(Double.valueOf(refundAmount));
            refundTransaction.setBooking(transactionType.getBooking());
            refundTransaction.setStatus(TransactionEnum.REFUND);
            refundTransaction.setPaymentDate(new Date());

            transactionRepository.save(refundTransaction);
            bookingRepository.save(booking);
            authenticationRepository.save(customerAccount);
            authenticationRepository.save(clubOwnerAccount);
            authenticationRepository.save(toAccount);
            System.out.println("Transaction Status: " + transactionType.getStatus());
            System.out.println("Refund Amount: " + refundAmount);
        }
    }






    public void sendBookingConfirmation(QRCodeData data,String email) throws WriterException, IOException, MessagingException {
        System.out.println(email);
        EmailDetail emailDetail = new EmailDetail();
        emailDetail.setRecipient(email);
        emailDetail.setSubject("Booking successfully" );
        emailDetail.setMsgBody("");
        Runnable r = new Runnable() {
            @Override
            public void run() {
                emailService.sendEmailWithAttachment(emailDetail, data);
            }
        };
        new Thread(r).start();
    }

    public boolean validateQrCode(byte[] qrCodeData, QRCodeData expectedData) throws IOException,NotFoundException {
        QRCodeData decodedData = qrCodeService.decodeQr(qrCodeData);
        return decodedData != null && decodedData.getBookingId().equals(expectedData.getBookingId());
    }
    public Map<String, Long> getBookingStatusCounts(Long clubId) {
        Map<String, Long> statusCounts = new HashMap<>();
        statusCounts.put("CANCELED", bookingRepository.countByClubIdAndStatus(clubId, BookingStatusEnum.CANCELED));
        statusCounts.put("COMPLETED", bookingRepository.countByClubIdAndStatus(clubId, BookingStatusEnum.COMPLETED));
        return statusCounts;
    }

    //    public List<Booking> getBookingsByCustomerId(Long customerId) {
//        List<Booking> bookingList= bookingRepository.findBookingsByDeletedFalse();
//        if (!authenticationRepository.existsById(customerId)) {
//            throw new IllegalArgumentException("Booking not found with id: " + customerId);
//        }
//
//        List<Booking> allBookings = bookingRepository.findBookingsByDeletedFalse();
//
//        // Filter the courts by clubId using a for loop
//        List<Booking> Bookings = new ArrayList<>();
//        for (Booking booking : allBookings) {
//            if (booking.getAccount().getAccountId() == customerId) {
//                Bookings.add(booking);
//            }
//        }
//        return Bookings;
//
//    }
    public BookingComboResponse createBookingCombo(BookingComboRequest bookingComboRequest){
        List<BookingDetail> bookingDTList = bookingDetailRepository.findBookingDetailsByDeletedFalse();
        List<BookingDetailRequestCombo> bookingDetailCheck = bookingComboRequest.getBookingDetailRequestCombos();
        for (BookingDetail bookingdt : bookingDTList) {
            for(BookingDetailRequestCombo bookingDetailRequest : bookingDetailCheck) {
                LocalDate startDate = bookingDetailRequest.getBookingDate();
                Date datee = Date.from(startDate.atStartOfDay().atZone(ZoneId.systemDefault()).toInstant());
                    if ((bookingdt.getDate().compareTo(datee) == 0) && bookingdt.getCourtTimeslot().getCourtTSlotID() == bookingDetailRequest.getCourtTSId()) {
                        throw new IllegalArgumentException("CourtTimeslot are already in use");
                }
            }
        }
        BookingResponse bookingCreateTemporary = createBookingNew(bookingComboRequest.getClub_id(),bookingComboRequest.getBooking_type_id());
        BookingComboResponse bookingComboResponse = new BookingComboResponse();
        bookingComboResponse.setBookingResponse(bookingCreateTemporary);
        List<BookingDetailRequestCombo> bookingDetailResponseList = bookingComboRequest.getBookingDetailRequestCombos();
        List<BookingDetailRequest> returnlist = new ArrayList<>();
        BookingDetailRequest store;
        Long id = bookingCreateTemporary.getId();
        if(bookingCreateTemporary.getBookingTypeId() == 1){
            for(BookingDetailRequestCombo bookingDetailRun : bookingDetailResponseList) {
                store = bookingDetailService.create1stBookingDetailCombo(bookingDetailRun, id);
                returnlist.add(store);
            }
        } else if (bookingCreateTemporary.getBookingTypeId() == 2) {
            List<BookingDetailRequest> returnlistAdd = new ArrayList<>();
            for(BookingDetailRequestCombo bookingDetailRun : bookingDetailResponseList) {
                returnlistAdd = bookingDetailService.createFixedBookingDetailCombos(bookingDetailRun, id);
                returnlist.addAll(returnlistAdd);
            }
        } else if (bookingCreateTemporary.getBookingTypeId() == 3) {
            for(BookingDetailRequestCombo bookingDetailRun : bookingDetailResponseList) {
                store = bookingDetailService.create3rdBookingDetailCombo(bookingDetailRun, id);
                returnlist.add(store);
            }
        }
        bookingComboResponse.setBookingDetailRequestList(returnlist);
        return bookingComboResponse;
    }
//    public void sendBookingConfirmation(QRCodeData data,String email) throws WriterException, IOException, MessagingException {
//        System.out.println(email);
//        EmailDetail emailDetail = new EmailDetail();
//        emailDetail.setRecipient(email);
//        emailDetail.setSubject("Booking successfully" );
//        emailDetail.setMsgBody("");
//        Runnable r = new Runnable() {
//            @Override
//            public void run() {
//                emailService.sendEmailWithAttachment(emailDetail, data);
//            }
//        };
//        new Thread(r).start();
//    }
    @Transactional
    @Scheduled(cron = "0 0 20 * * *") // Run every day at 7 PM
    public void sendReminderEmails() {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String startTime = dateFormat.format(new Date());
        logger.info("Background job for sending reminder emails is running at {}.", startTime);

        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, 1);
        Date tomorrow = cal.getTime();

        List<BookingDetail> bookingDetails = bookingDetailRepository.findBookingDetailsForTomorrow(tomorrow);
        logger.info("Found {} booking details for tomorrow", bookingDetails.size());

        // Group booking details by booking
        Map<Booking, List<BookingDetail>> bookingDetailsByBooking = new HashMap<>();
        for (BookingDetail bookingDetail : bookingDetails) {
            bookingDetailsByBooking.computeIfAbsent(bookingDetail.getBooking(), k -> new ArrayList<>()).add(bookingDetail);
        }

        for (Map.Entry<Booking, List<BookingDetail>> entry : bookingDetailsByBooking.entrySet()) {
            Booking booking = entry.getKey();
            if (booking.getAccount().getRole() == RoleEnum.CUSTOMER) {
                List<BookingDetail> details = entry.getValue();
                try {
                    emailService.sendEmailReminder(booking, details);
                } catch (MessagingException e) {
                    logger.error("Failed to send email reminder for Booking ID: {}", booking.getBookingId(), e);
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        }

        logger.info("Background job for sending reminder emails has completed.");

    }
}
