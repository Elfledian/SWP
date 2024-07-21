package click.badcourt.be.service;

import click.badcourt.be.entity.*;
import click.badcourt.be.enums.BookingStatusEnum;
import click.badcourt.be.enums.TransactionEnum;
import click.badcourt.be.model.request.QRCodeData;
import click.badcourt.be.model.request.RechargeRequest;
import click.badcourt.be.model.request.TransactionRequest;
import click.badcourt.be.model.response.*;
import click.badcourt.be.repository.*;
import click.badcourt.be.utils.AccountUtils;
import com.google.zxing.WriterException;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private AuthenticationRepository authenticationRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private BookingDetailRepository bookingDetailRepository;
    @Autowired
    private ClubRepository clubRepository;
    @Autowired
    private BookingTypeRepository bookingTypeRepository;
    @Autowired
    private AccountUtils accountUtils;
    @Autowired
    private BookingService bookingService;

    public Long integerPart;

    public List<TransactionRechargeResponse> getRechargeTransactions(Long accountId) {
        Account account = authenticationRepository.findById(accountId).orElse(null);
        if (account == null) {
            throw new RuntimeException("Account not found.");
        }

        List<Transaction> transactions = transactionRepository.findTransactionsByAccountAndStatuses(account, Arrays.asList(TransactionEnum.RECHARGE, TransactionEnum.WITHDRAW));
        List<TransactionRechargeResponse> transactionResponses = new ArrayList<>();
        for (Transaction transaction : transactions) {
            TransactionRechargeResponse transactionResponse = new TransactionRechargeResponse();
            transactionResponse.setTransactionId(transaction.getTransactionId());
            transactionResponse.setTransactionDate(transaction.getPaymentDate());
            transactionResponse.setTransactionStatus(transaction.getStatus());
            /*if (transaction.getStatus() == TransactionEnum.WITHDRAW_REJECT || transaction.getStatus() == TransactionEnum.WITHDRAW_SUCCESS) {
                transactionResponse.setAccountBalance(transaction.getFromaccount().getBalance());
            } else {
                transactionResponse.setAccountBalance(transaction.getToaccount().getBalance());
            }*/
            transactionResponse.setTotalAmount(transaction.getTotalAmount());
            transactionResponses.add(transactionResponse);
        }
        return transactionResponses;
    }


    public List<TransactionResponse> findAll() {
        List<Transaction> transactions = transactionRepository.findAll();
        List<TransactionResponse> transactionResponses = new ArrayList<>();
        for (Transaction transaction : transactions) {
            TransactionResponse transactionResponse = new TransactionResponse();
            transactionResponse.setBookingId(transaction.getBooking().getBookingId());
            transactionResponse.setId(transaction.getTransactionId());
            transactionResponse.setPaymentDate(transaction.getPaymentDate());
            transactionResponse.setTotalAmount(transaction.getTotalAmount());
            transactionResponse.setDepositAmount(transaction.getDepositAmount());
            transactionResponse.setStatus(transaction.getStatus().toString());
            transactionResponses.add(transactionResponse);
        }
        return transactionResponses;
    }
    public List<TransactionUnderTopUpResponse> findAllByFromAccountId(Long accountId) {
        List<Transaction> transactions = transactionRepository.findAllByFromaccount_AccountId(accountId);
        List<TransactionUnderTopUpResponse> transactionResponses = new ArrayList<>();
        for (Transaction transaction : transactions) {
            if (transaction.getStatus() == TransactionEnum.FULLY_PAID || transaction.getStatus() == TransactionEnum.REFUND) {
                TransactionUnderTopUpResponse transactionResponse = new TransactionUnderTopUpResponse();
                transactionResponse.setTransactionid(transaction.getTransactionId());
                transactionResponse.setTransactiondate(transaction.getPaymentDate());
                transactionResponse.setTransactionstatus(transaction.getStatus());
                transactionResponse.setTotalamount(transaction.getTotalAmount());
                transactionResponse.setBookingid(transaction.getBooking().getBookingId());
                transactionResponses.add(transactionResponse);
            }
        }
        return transactionResponses;
    }


    //    public Transaction addTransactionPending(TransactionRequest transactionRequest) {
//        Optional<Booking> booking= bookingRepository.findById(transactionRequest.getBookingId());
//        if(booking.isPresent()) {
//            Transaction transaction = new Transaction();
//            transaction.setDepositAmount(TotalPrice(transactionRequest.getBookingId())*50/100);
//            transaction.setTotalAmount(TotalPrice(booking.get().getBookingId()));
//            transaction.setPaymentDate(new Date());
//            transaction.setBooking(booking.get());
//            return transactionRepository.save(transaction);
//        }
//        else{
//            throw new IllegalArgumentException("PaymentMethod or Booking not found");
//        }
//    }
    public Transaction addTransaction(TransactionRequest transactionRequest) throws MessagingException, IOException, WriterException {
        Optional<Booking> booking= bookingRepository.findById(transactionRequest.getBookingId());
        if(booking.isPresent()) {
            Transaction transaction = new Transaction();
            if(transactionRequest.getStatus().equals("00")) {
                if (booking.get().getBookingType().getBookingTypeId() == 1){
                    transaction.setStatus(TransactionEnum.DEPOSITED);
                    booking.get().setStatus(BookingStatusEnum.COMPLETED);
                    Double money = TotalPrice(transactionRequest.getBookingId()) * 0.5;
                    integerPart = money.longValue();
                    money = integerPart.doubleValue();
                    transaction.setDepositAmount(money);
                    }
                else {
                    transaction.setStatus(TransactionEnum.FULLY_PAID);
                    booking.get().setStatus(BookingStatusEnum.COMPLETED);
                    transaction.setDepositAmount(0.0);
                }
                QRCodeData qrCodeData = new QRCodeData();
                qrCodeData.setBookingId(booking.get().getBookingId());
                bookingService.sendBookingConfirmation(qrCodeData,booking.get().getAccount().getEmail());
            }
            else {
                transaction.setStatus(TransactionEnum.CANCELED);
                booking.get().setStatus(BookingStatusEnum.CANCELED);
            }
            transaction.setTotalAmount(TotalPrice(transactionRequest.getBookingId()));
            transaction.setPaymentDate(new Date());
            transaction.setBooking(booking.get());
            return transactionRepository.save(transaction);
        }
        else{
            throw new IllegalArgumentException("PaymentMethod or Booking not found");
        }
    }
    public Transaction addTransactionWallet(Long bookingId) throws MessagingException, IOException, WriterException {
        Optional<Booking> booking= bookingRepository.findById(bookingId);
        if(booking.isPresent()) {
            Account account = accountUtils.getCurrentAccount();
            double totalAmount = TotalPrice(bookingId);
            double amountToDeduct = totalAmount;

            if(account.getBalance() < amountToDeduct) {
                throw new IllegalArgumentException("Insufficient balance");
            }

            Transaction transaction = new Transaction();
            Account designatedAccount = authenticationRepository.findById(1L).orElseThrow(() -> new IllegalArgumentException("Designated account not found"));
            if (booking.get().getBookingType().getBookingTypeId() == 1){
                transaction.setStatus(TransactionEnum.DEPOSITED);
                booking.get().setStatus(BookingStatusEnum.COMPLETED);
                Double money = totalAmount * 0.5;
                integerPart = money.longValue();
                money = integerPart.doubleValue();
                transaction.setDepositAmount(money);
                amountToDeduct = money;
            }
            else {
                transaction.setStatus(TransactionEnum.FULLY_PAID);
                booking.get().setStatus(BookingStatusEnum.COMPLETED);
                transaction.setDepositAmount(0.0);
            }
            QRCodeData qrCodeData = new QRCodeData();
            qrCodeData.setBookingId(booking.get().getBookingId());
            bookingService.sendBookingConfirmation(qrCodeData,booking.get().getAccount().getEmail());
            transaction.setTotalAmount(totalAmount);
            transaction.setPaymentDate(new Date());
            transaction.setBooking(booking.get());
            transaction.setFromaccount(account);
            transaction.setToaccount(designatedAccount);

            account.setBalance((float)(account.getBalance() - amountToDeduct));
            designatedAccount.setBalance((float)(designatedAccount.getBalance() + amountToDeduct));
            authenticationRepository.updateBalance(account.getBalance(), account.getAccountId());
            authenticationRepository.updateBalance(designatedAccount.getBalance(), designatedAccount.getAccountId());
            return transactionRepository.save(transaction);
        }
        else{
            throw new IllegalArgumentException("PaymentMethod or Booking not found");
        }
    }




    public Transaction RechargeTransaction(Long transactionId)  {
        Account account = accountUtils.getCurrentAccount();
        Transaction transaction = transactionRepository.findById(transactionId).orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (transaction.getStatus().equals(TransactionEnum.PENDING) && transaction.getToaccount().getAccountId().equals(account.getAccountId())) {
            double rechargeMoney = transaction.getTotalAmount();
            account.setBalance(account.getBalance() + (float)rechargeMoney);
            authenticationRepository.save(account);
            transaction.setStatus(TransactionEnum.RECHARGE);
            return transactionRepository.save(transaction);
        } else {
            throw new RuntimeException("Invalid transaction");
        }
    }

    public int updateBalance(Long fromId, Long toId, double amount) {
        Account fromAccount = authenticationRepository.findAccountByAccountId(fromId);
        Account toAccount = authenticationRepository.findAccountByAccountId(toId);
        if(fromAccount == null && toAccount == null)
        {
            return 0;
        }else if(fromAccount == null && toAccount != null) {
            toAccount.setBalance(toAccount.getBalance() + (float) amount);
            authenticationRepository.save(toAccount);
            return 1;
        }else if(fromAccount != null && toAccount == null) {
            fromAccount.setBalance(toAccount.getBalance() - (float) amount);
            authenticationRepository.save(fromAccount);
            return 2;
        }else if(fromAccount != null && toAccount != null) {
            fromAccount.setBalance(fromAccount.getBalance()-(float)amount);
            toAccount.setBalance(toAccount.getBalance()+(float)amount);
            authenticationRepository.save(fromAccount);
            authenticationRepository.save(toAccount);
            return 3;
        }else return 0;
    }



    public Double TotalPrice(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        List<BookingDetail> bookingDetails = bookingDetailRepository.findBookingDetailsByBooking_BookingId(bookingId);
        Double totalPrice = 0.0;

        if (booking.getBookingType().getBookingTypeId() == 1) {
            totalPrice += booking.getClub().getPrice();
            totalPrice = totalPrice * (1 - booking.getBookingType().getBookingDiscount());
        } else if (booking.getBookingType().getBookingTypeId() == 2 || booking.getBookingType().getBookingTypeId() == 3) {
            totalPrice = booking.getClub().getPrice() *
                    (1 - booking.getBookingType().getBookingDiscount()) *
                    bookingDetailRepository.countBookingDetailsByBooking(booking)+1;
        }

        // Truncate to the nearest thousand
        long integerPart = (totalPrice).longValue();
        long truncatedValue = (integerPart / 1000) * 1000;
        totalPrice = (double) truncatedValue;

        return totalPrice;
    }


    public PreTransactionResponse TotalPriceCombo(Long bookingId){
        Booking booking= bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        int n = bookingDetailRepository.countBookingDetailsByBooking(booking);
        Double totalPrice = booking.getClub().getPrice()*n;
        PreTransactionResponse preTransactionResponse= new PreTransactionResponse();
        preTransactionResponse.setFullPrice(totalPrice);
        preTransactionResponse.setTotalPriceNeedToPay(TotalPrice(booking.getBookingId()));
        preTransactionResponse.setSalePrice(preTransactionResponse.getFullPrice() - preTransactionResponse.getTotalPriceNeedToPay());
        return preTransactionResponse;
    }


    public TransactionResponse getTransactionsByBookingId(Long bookingId) {
        Transaction transaction = transactionRepository.findByBooking_BookingId(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        Long ownerId = accountUtils.getCurrentAccount().getAccountId();
        if(Objects.equals(transaction.getBooking().getClub().getAccount().getAccountId(), ownerId)) {
            TransactionResponse transactionResponse = new TransactionResponse();
            transactionResponse.setBookingId(transaction.getBooking().getBookingId());
            transactionResponse.setId(transaction.getTransactionId());
            transactionResponse.setPaymentDate(transaction.getPaymentDate());
            transactionResponse.setTotalAmount(transaction.getTotalAmount());
            transactionResponse.setDepositAmount(transaction.getDepositAmount());
            transactionResponse.setStatus(transaction.getStatus().toString());
            return transactionResponse;
        }else{
            throw new IllegalArgumentException("Transaction not found");
        }
    }

    public Long getPredictedPriceByGivenInfo(Long clubId, Long bookingTypeId, Integer num) {
        Double money = 0.0;
        Club club = clubRepository.findClubByClubId(clubId);
        Double price = club.getPrice();
        Double scale = Double.valueOf(1 - bookingTypeRepository.findBookingTypeByBookingTypeId(bookingTypeId).getBookingDiscount());
        Double cal = price * num;
        if (bookingTypeId == 1){
            money = price;
        } else if (bookingTypeId == 2 || bookingTypeId == 3){
            money = (cal * scale);
            integerPart = money.longValue();
            money = integerPart.doubleValue();
        }
        return money.longValue();
    }

    public Long getPredictedPriceByGivenInfoCombo(Long clubId, Long bookingTypeId, Integer num) {
        Double money = 0.0;
        Club club = clubRepository.findClubByClubId(clubId);
        Double price = club.getPrice();
        Double scale = Double.valueOf(1 - bookingTypeRepository.findBookingTypeByBookingTypeId(bookingTypeId).getBookingDiscount());
        Double cal = price * num;
        if (bookingTypeId == 1){
            money = price-price*0.5;
            integerPart = money.longValue();
            money = integerPart.doubleValue();
        } else if (bookingTypeId == 2 || bookingTypeId == 3){
            money = cal * scale;
            integerPart = money.longValue();
            money = integerPart.doubleValue();
        }
        return money.longValue();
    }


    public void updateFullyPaid(Long transactionId){
        Optional<Transaction> transaction = transactionRepository.findById(transactionId);
        if(transaction.isPresent()&&transaction.get().getStatus().equals(TransactionEnum.DEPOSITED)){
            transaction.get().setStatus(TransactionEnum.FULLY_PAID);
        }
        transactionRepository.save(transaction.get());
    }
    public List<TotalAmountByMonthDTO> getTotalAmountByMonth(int year) {
        List<Object[]> result = transactionRepository.getTotalAmountByMonth(year);

        // Initialize array for 12 months with total amount 0
        List<TotalAmountByMonthDTO> totalAmountByMonthList = IntStream.rangeClosed(1, 12)
                .mapToObj(month -> new TotalAmountByMonthDTO(month, year, 0.0))
                .collect(Collectors.toList());

        // Populate actual data for months with transactions
        for (Object[] row : result) {
            int month = (int) row[0];
            double totalAmount = (double) row[1];

            // Find the corresponding DTO and update total amount
            TotalAmountByMonthDTO dto = totalAmountByMonthList.stream()
                    .filter(item -> item.getMonth() == month)
                    .findFirst()
                    .orElse(null);

            if (dto != null) {
                dto.setTotalAmount(totalAmount);
            }
        }

        return totalAmountByMonthList;
    }
    public Double calculateMonthlyRevenueByClub(int year, int month, Long clubId) {
        Double revenue = transactionRepository.calculateMonthlyRevenueByClub(year, month, clubId);
        return revenue != null ? revenue : 0.0;
    }

    public Double calculateYearlyRevenueByClub(int year, Long clubId) {
        Double revenue = transactionRepository.calculateYearlyRevenueByClub(year, clubId);
        return revenue != null ? revenue : 0.0;
    }

    public List<TotalAmountByPeriodDTO> getTotalRevenueForClubOwner(Long clubId,String period, Integer month, Integer year) {
        Club club = clubRepository.findClubByClubId(clubId);
        Map<String, Double> revenueByPeriod = new HashMap<>();
        switch (period) {
            case "month":
                if (month == null || year == null) {
                    throw new IllegalArgumentException("Month and year must be provided for monthly revenue calculation");
                }
                YearMonth yearMonth = YearMonth.of(year, month);
                int daysInMonth = yearMonth.lengthOfMonth();
                for (int day = 1; day <= daysInMonth; day++) {
                    revenueByPeriod.put(day + "-" + month + "-" + year, 0.0);
                }
                break;
            case "year":
                if (year == null) {
                    throw new IllegalArgumentException("Year must be provided for yearly revenue calculation");
                }
                for (int m = 1; m <= 12; m++) {
                    revenueByPeriod.put(m + "-" + year, 0.0);
                }
                break;
            default:
                throw new IllegalArgumentException("Invalid period: " + period);
        }
        List<Booking> bookings = bookingRepository.findBookingsByClub_ClubId(club.getClubId());
        for (Booking booking : bookings) {
            List<Transaction> transactions = transactionRepository.findByBooking_BookingIdAndStatus(booking.getBookingId(), TransactionEnum.FULLY_PAID);
            for (Transaction transaction : transactions) {
                LocalDate transactionDate = transaction.getPaymentDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                String periodKey;
                switch (period) {
                    case "month":
                        if (transactionDate.getMonthValue() == month &&
                                transactionDate.getYear() == year) {
                            periodKey = transactionDate.getDayOfMonth() + "-" + transactionDate.getMonthValue() + "-" + transactionDate.getYear(); // "1-7-2024"
                        } else {
                            continue;
                        }
                        break;
                    case "year":
                    default:
                        if (transactionDate.getYear() == year) {
                            periodKey = transactionDate.getMonthValue() + "-" + transactionDate.getYear();
                        } else {
                            continue;
                        }
                        break;
                }
                double totalAmount = transaction.getTotalAmount();
                revenueByPeriod.put(periodKey, revenueByPeriod.getOrDefault(periodKey, 0.0) + totalAmount);
            }
        }
        List<TotalAmountByPeriodDTO> result = new ArrayList<>();
        for (Map.Entry<String, Double> entry : revenueByPeriod.entrySet()) {
            result.add(new TotalAmountByPeriodDTO(entry.getKey(), entry.getValue()));
        }
        result.sort(Comparator.comparing(TotalAmountByPeriodDTO::getPeriod));
        return result;
    }












    //    public Transaction updateTransaction(TransactionRequest transactionRequest,Long id) {
//        Optional<Transaction> transaction = transactionRepository.findById(id);
//        if(transaction.isEmpty()) {
//            throw new IllegalArgumentException("Transaction not found");
//        }
//        Optional<PaymentMethod> paymentMethod = paymentMethodRepository.findById(transactionRequest.getPaymentMethodId());
//        Optional<Booking> booking = bookingRepository.findById(transactionRequest.getBookingId());
//        if(paymentMethod.isPresent() && booking.isPresent()) {
//            transaction.get().setDepositAmount(transactionRequest.getTotalAmount()*50/100);
//            transaction.get().setTotalAmount(TotalPrice(booking.get().getBookingId()));
//            transaction.get().setPaymentDate(transactionRequest.getPaymentDate());
//            transaction.get().setPaymentMethod(paymentMethod.get());
//            transaction.get().setBooking(booking.get());
//            return transactionRepository.save(transaction.get());
//        }
//        else {
//            throw new IllegalArgumentException("PaymentMethod or Booking not found");
//        }
//    }
}
