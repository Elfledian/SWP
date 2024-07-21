package click.badcourt.be.service;

import click.badcourt.be.entity.Account;
import click.badcourt.be.entity.Booking;
import click.badcourt.be.entity.Club;
import click.badcourt.be.entity.Transaction;

import click.badcourt.be.enums.BookingStatusEnum;
import click.badcourt.be.enums.RoleEnum;
import click.badcourt.be.enums.TransactionEnum;
import click.badcourt.be.model.request.RechargeRequestDTO;
import click.badcourt.be.model.request.WalletRechargeDTO;

import click.badcourt.be.model.response.TransactionResponseDTO;
import click.badcourt.be.repository.AuthenticationRepository;
import click.badcourt.be.repository.BookingRepository;
import click.badcourt.be.repository.ClubRepository;
import click.badcourt.be.repository.TransactionRepository;
import click.badcourt.be.utils.AccountUtils;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import java.net.URLDecoder;

@Service
public class WalletService {
    @Autowired
    AccountUtils accountUtils;
    @Autowired
    AuthenticationRepository authenticationRepository;
    @Autowired
    TransactionRepository transactionRepository;
    @Autowired
    BookingRepository bookingRepository;
    @Autowired
    ClubRepository clubRepository;
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    @Autowired
    private TransactionService transactionService;
    @Autowired
    private EmailService emailService;

    public float getBalance(Long accountId) {
        Account account = authenticationRepository.findById(accountId).orElse(null);
        if (account != null) {
            return account.getBalance();
        } else {
            throw new RuntimeException("Account not found.");
        }
    }

    public double withDraw(double amount) {
        double minWithdrawalAmount = 1000.0;
        if (amount < minWithdrawalAmount) {
            throw new RuntimeException("The minimum withdrawal amount is " + minWithdrawalAmount);
        }
        Account account = accountUtils.getCurrentAccount();
        if (account.getBalance() >= amount) {
            Transaction transaction = new Transaction();
            transaction.setFromaccount(account);
            transaction.setTotalAmount(amount);
            transaction.setStatus(TransactionEnum.WITHDRAW);
            transaction.setPaymentDate(new Date());
            account.setBalance(account.getBalance() - (float)amount);
            authenticationRepository.save(account);
            transactionRepository.save(transaction);
            return account.getBalance();
        } else {
            throw new RuntimeException("Insufficient balance in wallet for withdrawal.");
        }
    }





    public List<TransactionResponseDTO> requestWithDraw() {
        List<TransactionResponseDTO> listTransactionResponseDTO = new ArrayList<>();
        List<Transaction> transactions = transactionRepository.findByStatus(TransactionEnum.WITHDRAW);
        for (Transaction transaction : transactions) {
            TransactionResponseDTO transactionResponseDTO = new TransactionResponseDTO();
            transactionResponseDTO.setTransactionID(transaction.getTransactionId());
            transactionResponseDTO.setTransactionType(transaction.getStatus());
            transactionResponseDTO.setAmount(transaction.getTotalAmount());
            transactionResponseDTO.setTransactionDate(transaction.getPaymentDate());
            transactionResponseDTO.setFromEmail(transaction.getFromaccount().getEmail());


            listTransactionResponseDTO.add(transactionResponseDTO);
        }

        if (listTransactionResponseDTO.isEmpty()) {
            System.out.println("There are no withdrawals at the moment");
        }

        return listTransactionResponseDTO;
    }




    public Transaction acpWithDraw(Long id) {
        Transaction transaction = transactionRepository.findById(id).orElse(null);
        if (transaction != null && transaction.getStatus() == TransactionEnum.WITHDRAW) {
            transaction.setStatus(TransactionEnum.WITHDRAW);
            return transactionRepository.save(transaction);
        } else {
            throw new RuntimeException("Transaction not found or not in pending state.");
        }
    }

    public Transaction rejectWithDraw(Long id) {
        Transaction transaction = transactionRepository.findById(id).orElse(null);
        if (transaction != null && transaction.getStatus() == TransactionEnum.WITHDRAW) {
            Account account = transaction.getFromaccount();
            account.setBalance(account.getBalance() + transaction.getTotalAmount().floatValue());
            authenticationRepository.save(account);
            transaction.setStatus(TransactionEnum.WITHDRAW);
            return transactionRepository.save(transaction);
        } else {
            throw new RuntimeException("Transaction not found or not in pending state.");
        }
    }

    public String createUrlRecharge(WalletRechargeDTO rechargeRequestDTO) throws NoSuchAlgorithmException, InvalidKeyException, Exception{
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        LocalDateTime createDate = LocalDateTime.now();
        String formattedCreateDate = createDate.format(formatter);

        Account account = accountUtils.getCurrentAccount();

        String orderId = UUID.randomUUID().toString().substring(0,6);
        Transaction transaction = new Transaction();

        transaction.setPaymentDate(new Date());
        double totalAmount = Double.parseDouble(rechargeRequestDTO.getAmount());
        transaction.setTotalAmount(totalAmount);
        transaction.setToaccount(account);
        transaction.setStatus(TransactionEnum.PENDING);
        Transaction savedTransaction = transactionRepository.save(transaction);

        String tmnCode = "NI3BAGS1";
        String secretKey = "2AZPVYA4RTHWMOQKDGK3FR0OMSR20SKY";
        String vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        //String returnUrl = "http://badcourts.click/transactions" + savedTransaction.getTransactionId();
        String returnUrl = "http://badcourts.click/transactions";
        String currCode = "VND";
        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", tmnCode);
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_CurrCode", currCode);
        vnpParams.put("vnp_TxnRef", savedTransaction.getTransactionId().toString());
        vnpParams.put("vnp_OrderInfo",savedTransaction.getTransactionId().toString());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Amount", rechargeRequestDTO.getAmount() +"00");
        vnpParams.put("vnp_ReturnUrl", returnUrl);
        vnpParams.put("vnp_CreateDate", formattedCreateDate);
        vnpParams.put("vnp_IpAddr", "128.199.178.23");

        StringBuilder signDataBuilder = new StringBuilder();
        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            signDataBuilder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8.toString()));
            signDataBuilder.append("=");
            signDataBuilder.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString()));
            signDataBuilder.append("&");
        }
        signDataBuilder.deleteCharAt(signDataBuilder.length() - 1); // Remove last '&'

        String signData = signDataBuilder.toString();
        String signed = generateHMAC(secretKey, signData);

        vnpParams.put("vnp_SecureHash", signed);

        StringBuilder urlBuilder = new StringBuilder(vnpUrl);
        urlBuilder.append("?");
        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            urlBuilder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8.toString()));
            urlBuilder.append("=");
            urlBuilder.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString()));
            urlBuilder.append("&");
        }
        urlBuilder.deleteCharAt(urlBuilder.length() - 1); // Remove last '&'

        return urlBuilder.toString();
    }


    public String createUrl(RechargeRequestDTO rechargeRequestDTO) throws NoSuchAlgorithmException, InvalidKeyException, Exception{
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        LocalDateTime createDate = LocalDateTime.now();
        String formattedCreateDate = createDate.format(formatter);

        Account user = accountUtils.getCurrentAccount();

        String orderId = rechargeRequestDTO.getBookingId().toString();

//        Wallet wallet = walletRepository.findWalletByUser_Id(user.getId());
//
//        Transaction transaction = new Transaction();
//
//        transaction.setAmount(Float.parseFloat(rechargeRequestDTO.getAmount()));
//        transaction.setTransactionType(TransactionEnum.PENDING);
//        transaction.setTo(wallet);
//        transaction.setTransactionDate(formattedCreateDate);
//        transaction.setDescription("Recharge");
//        Transaction transactionReturn = transactionRepository.save(transaction);

        String tmnCode = "NI3BAGS1";
        String secretKey = "2AZPVYA4RTHWMOQKDGK3FR0OMSR20SKY";
        String vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        String returnUrl = "http://badcourts.click/transactions";

        String currCode = "VND";
        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", tmnCode);
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_CurrCode", currCode);
        vnpParams.put("vnp_TxnRef", orderId);
        vnpParams.put("vnp_OrderInfo",orderId);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Amount", rechargeRequestDTO.getAmount() +"00");
        vnpParams.put("vnp_ReturnUrl", returnUrl);
        vnpParams.put("vnp_CreateDate", formattedCreateDate);
        vnpParams.put("vnp_IpAddr", "128.199.178.23");

        StringBuilder signDataBuilder = new StringBuilder();
        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            signDataBuilder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8.toString()));
            signDataBuilder.append("=");
            signDataBuilder.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString()));
            signDataBuilder.append("&");
        }
        signDataBuilder.deleteCharAt(signDataBuilder.length() - 1); // Remove last '&'

        String signData = signDataBuilder.toString();
        String signed = generateHMAC(secretKey, signData);

        vnpParams.put("vnp_SecureHash", signed);

        StringBuilder urlBuilder = new StringBuilder(vnpUrl);
        urlBuilder.append("?");
        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            urlBuilder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8.toString()));
            urlBuilder.append("=");
            urlBuilder.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString()));
            urlBuilder.append("&");
        }
        urlBuilder.deleteCharAt(urlBuilder.length() - 1); // Remove last '&'

        return urlBuilder.toString();
    }




    public Map<String, String> getUrlParameters(String url) throws Exception {
        Map<String, String> params = new HashMap<>();
        String[] urlParts = url.split("\\?");
        if (urlParts.length > 1) {
            String query = urlParts[1];
            for (String param : query.split("&")) {
                String[] pair = param.split("=");
                String key = URLDecoder.decode(pair[0], "UTF-8");
                String value = "";
                if (pair.length > 1) {
                    value = URLDecoder.decode(pair[1], "UTF-8");
                }
                params.put(key, value);
            }
        }
        return params;
    }


    private String generateHMAC(String secretKey, String signData) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac hmacSha512 = Mac.getInstance("HmacSHA512");
        SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        hmacSha512.init(keySpec);
        byte[] hmacBytes = hmacSha512.doFinal(signData.getBytes(StandardCharsets.UTF_8));

        StringBuilder result = new StringBuilder();
        for (byte b : hmacBytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
    @Transactional
    @Scheduled(cron = "0 50 12 * * *") // Run every day at 7 PM
    public void transferFundsToClubOwners() {
        logger.info("Background job for transferring funds is running at {}", new Date());

        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, -2);
        Date twoDaysAgo = cal.getTime();

        List<Booking> completedBookings = bookingRepository.findCompletedBookings();

        for (Booking booking : completedBookings) {
            boolean hasOldBookingDetail = booking.getBookingDetails().stream()
                    .anyMatch(detail -> detail.getDate().before(twoDaysAgo));

            if (hasOldBookingDetail) {
                Account clubOwner = booking.getClub().getAccount();
                Account admin = authenticationRepository.findByRole(RoleEnum.ADMIN);

                if (admin == null) {
                    logger.error("No admin account found. Cannot proceed with the transfer.");
                    return;
                }

                double transferAmount = calculateTransferAmount(booking);

                if (admin.getBalance() >= transferAmount) {
                    admin.setBalance(admin.getBalance() - (float) transferAmount);
                    clubOwner.setBalance(clubOwner.getBalance() + (float) transferAmount);

                    Transaction transaction = new Transaction();
                    transaction.setBooking(booking);
                    transaction.setFromaccount(admin);
                    transaction.setToaccount(clubOwner);
                    transaction.setTotalAmount(transferAmount);
                    transaction.setPaymentDate(new Date());
                    transaction.setStatus(TransactionEnum.TRANSFER);

                    transactionRepository.save(transaction);
                    authenticationRepository.save(admin);
                    authenticationRepository.save(clubOwner);

                    booking.setStatus(BookingStatusEnum.PROCESSED);
                    bookingRepository.save(booking);

                    logger.info("Transferred {} from admin to club owner {} for booking ID {}", transferAmount, clubOwner.getEmail(), booking.getBookingId());
                } else {
                    logger.error("Insufficient balance in admin account for transferring {} to club owner {}", transferAmount, clubOwner.getEmail());
                }
            }
        }

        logger.info("Background job for transferring funds has completed.");
    }
    @Transactional
    @Scheduled(cron = "0 0 0 1 * *") // Run at midnight on the first day of every month
    public void chargeOfClubPosting() throws MessagingException, IOException {
        logger.info("Background job for Club charge is running at {}", new Date());
        int temp;
        List<Club> clubs = clubRepository.findClubsByDeletedFalse();
        Account admin = authenticationRepository.findByRole(RoleEnum.ADMIN);
        for (Club club : clubs) {
            if (club.getAccount().getBalance()<200000) {
                club.setDeleted(true);
                emailService.sendEmailDeleteReminder(club);
                logger.info("Club {} with ID: {} deleted for not having enough money in account.", club.getName(), club.getClubId());
            }
            else {
                Float oldMoney = (float) club.getAccount().getBalance();
                temp = transactionService.updateBalanceFromToAmount(club.getAccount(), admin, 200000);
                emailService.sendEmailFeeChargeAnnounce(club, oldMoney);
                logger.info("Transferred 200000 from club owner {} to admin for monthly fee charge", club.getAccount().getEmail());
            }
        }
        logger.info("Background job for charging fee monthly has completed.");
    }
    @Transactional
    @Scheduled(cron = "0 0 * * * *") // Run every hour
    public void retakeClub() throws MessagingException, IOException {
        logger.info("Background job for Club charge is running at {}", new Date());
        int temp;
        List<Club> clubs = clubRepository.findClubsByDeletedTrue();
        Account admin = authenticationRepository.findByRole(RoleEnum.ADMIN);
        for (Club club : clubs) {
            if (club.getAccount().getBalance()>=200000) {
                club.setDeleted(false);
                Float oldMoney = (float) club.getAccount().getBalance();
                temp = transactionService.updateBalanceFromToAmount(admin, club.getAccount(), 200000);
                emailService.sendEmailFeeChargeAnnounce(club, oldMoney);
                logger.info("Club {} with ID: {} reactivated after charging for retaking club.", club.getName(), club.getClubId());
            }
            else {
                logger.info("Club {} with ID: {} not meet requirement for retaking club, keep club deactivated.", club.getName(), club.getClubId());
            }
        }
        logger.info("Background job for retaking club has completed.");
    }


    private double calculateTransferAmount(Booking booking) {
        double transferAmount = 0.0;

        if (booking.getBookingType().getBookingTypeId() == 2 || booking.getBookingType().getBookingTypeId() == 3) {
            double fullyPaidAmount = booking.getTransaction().stream()
                    .filter(transaction -> transaction.getStatus() == TransactionEnum.FULLY_PAID)
                    .mapToDouble(Transaction::getTotalAmount)
                    .sum();
            transferAmount += fullyPaidAmount * 0.9;
        }

        if (booking.getBookingType().getBookingTypeId() == 1) {
            double depositedAmount = booking.getTransaction().stream()
                    .filter(transaction -> transaction.getStatus() == TransactionEnum.DEPOSITED)
                    .mapToDouble(Transaction::getTotalAmount)
                    .sum();
            transferAmount += depositedAmount * 0.4;
        }

        return roundToNearestThousand(transferAmount);
    }
    private double roundToNearestThousand(double amount) {
        return Math.round(amount / 1000.0) * 1000.0;
    }

}

