package click.badcourt.be.service;

import click.badcourt.be.entity.Account;
import click.badcourt.be.entity.Transaction;

import click.badcourt.be.enums.TransactionEnum;
import click.badcourt.be.model.request.RechargeRequestDTO;
import click.badcourt.be.model.request.WalletRechargeDTO;

import click.badcourt.be.model.response.TransactionResponseDTO;
import click.badcourt.be.repository.AuthenticationRepository;
import click.badcourt.be.repository.TransactionRepository;
import click.badcourt.be.utils.AccountUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
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
    public float getBalance(Long accountId) {
        Account account = authenticationRepository.findById(accountId).orElse(null);
        if (account != null) {
            return account.getBalance();
        } else {
            throw new RuntimeException("Account not found.");
        }
    }

    public Transaction withDraw(double amount) {
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
            return transactionRepository.save(transaction);
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
}
