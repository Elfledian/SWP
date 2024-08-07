package click.badcourt.be.service;

import click.badcourt.be.config.MomoConfig;
import click.badcourt.be.entity.Account;
import click.badcourt.be.entity.Transaction;
import click.badcourt.be.enums.TransactionEnum;
import click.badcourt.be.model.request.RechargeRequestDTO;
import click.badcourt.be.repository.TransactionRepository;
import click.badcourt.be.utils.AccountUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.security.InvalidKeyException;
import org.apache.commons.codec.binary.Hex;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import org.springframework.http.HttpHeaders;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class MomoService {
    @Autowired
    private MomoConfig momoConfig;
    @Autowired
    private AccountUtils accountUtils;
    @Autowired
    private TransactionRepository transactionRepository;
    public String createPaymentUrl(RechargeRequestDTO rechargeRequestDTO) throws Exception {
        String partnerCode = momoConfig.getPartnerCode();
        String accessKey = momoConfig.getAccessKey();
        String secretKey = momoConfig.getSecretKey();
        String requestId = partnerCode + System.currentTimeMillis();
        String redirectUrl = momoConfig.getReturnUrl();
        String ipnUrl = momoConfig.getNotifyUrl();
        String requestType = "payWithATM";
        String orderId="BadCourt"+ AuthenticationService.generateOTP(9);
        Account account = accountUtils.getCurrentAccount();

        Transaction transaction = new Transaction();

        transaction.setPaymentDate(new Date());
        double totalAmount = Double.parseDouble(rechargeRequestDTO.getAmount());
        transaction.setTotalAmount(totalAmount);
        transaction.setToaccount(account);
        transaction.setStatus(TransactionEnum.PENDING);
        Transaction savedTransaction=transactionRepository.save(transaction);

        String rawSignature = String.format(
                "accessKey=%s&amount=%s&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                accessKey, rechargeRequestDTO.getAmount(),  rechargeRequestDTO.getBookingId(), ipnUrl, orderId, savedTransaction.getTransactionId(), partnerCode, redirectUrl, requestId, requestType
        );

        String signature = generateHMAC(secretKey, rawSignature);

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("partnerCode", partnerCode);
        requestBody.put("accessKey", accessKey);
        requestBody.put("requestId", requestId);
        requestBody.put("amount", rechargeRequestDTO.getAmount());
        requestBody.put("orderId", orderId);
        requestBody.put("orderInfo", savedTransaction.getTransactionId().toString());
        requestBody.put("redirectUrl", redirectUrl);
        requestBody.put("ipnUrl", ipnUrl);
        requestBody.put("extraData", rechargeRequestDTO.getBookingId().toString());
        requestBody.put("requestType", requestType);
        requestBody.put("signature", signature);
        requestBody.put("lang", "en");

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonRequestBody = objectMapper.writeValueAsString(requestBody);

        URL url = new URL(momoConfig.getApiUrl() + "/v2/gateway/api/create");
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setDoOutput(true);
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8");

        connection.getOutputStream().write(jsonRequestBody.getBytes(StandardCharsets.UTF_8));

        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            String responseBody = new String(connection.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            JSONObject response = new JSONObject(responseBody);
            return response.getString("payUrl");
        } else {
            String errorResponse = new String(connection.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
            throw new Exception("Failed to create payment URL: " + errorResponse);
        }
    }

    private String generateHMAC(String secretKey, String data) throws NoSuchAlgorithmException, InvalidKeyException, java.security.InvalidKeyException {
        Mac hmacSha256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSha256.init(secretKeySpec);
        byte[] hmacBytes = hmacSha256.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder result = new StringBuilder();
        for (byte b : hmacBytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }

}
