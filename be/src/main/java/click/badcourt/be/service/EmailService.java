package click.badcourt.be.service;

import click.badcourt.be.entity.*;
import click.badcourt.be.model.request.QRCodeData;
import com.google.zxing.common.BitMatrix;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.List;

@Service
public class EmailService {

    @Autowired
    private TemplateEngine templateEngine;
    private static final Logger logger = LoggerFactory.getLogger(BookingDetailService.class);


    @Autowired
    private JavaMailSender javaMailSender;
    private QRCodeService qrCodeService;


    public void sendMailTemplate(EmailDetail emailDetail){
        try{
            Context context = new Context();

            context.setVariable("link",emailDetail.getLink());
            context.setVariable("button",emailDetail.getButtonValue());
            context.setVariable("name", emailDetail.getFullName());

            String text = templateEngine.process("emailresetpasswordtemplate", context);

            // Creating a simple mail message
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage);

            // Setting up necessary details
            mimeMessageHelper.setFrom("admin@gmail.com");
            mimeMessageHelper.setTo(emailDetail.getRecipient());
            mimeMessageHelper.setText(text, true);
            mimeMessageHelper.setSubject(emailDetail.getSubject());
            javaMailSender.send(mimeMessage);
        }catch (MessagingException messagingException){
            messagingException.printStackTrace();
        }
    }
    public void setPasswordMailTemplate(EmailDetail emailDetail){
        try{
            Context context = new Context();

            context.setVariable("link",emailDetail.getLink());
            context.setVariable("button",emailDetail.getButtonValue());
            context.setVariable("name", emailDetail.getFullName());

            String text = templateEngine.process("emailsetpasswordtemplate", context);

            // Creating a simple mail message
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage);

            // Setting up necessary details
            mimeMessageHelper.setFrom("admin@gmail.com");
            mimeMessageHelper.setTo(emailDetail.getRecipient());
            mimeMessageHelper.setText(text, true);
            mimeMessageHelper.setSubject(emailDetail.getSubject());
            javaMailSender.send(mimeMessage);
        }catch (MessagingException messagingException){
            messagingException.printStackTrace();
        }
    }

    public void setOTPMailTemplate(EmailDetail emailDetail,String otp){
        try{
            Context context = new Context();

            context.setVariable("otp",otp);

            String text = templateEngine.process("emailSendOTPTemplate", context);

            // Creating a simple mail message
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage);

            // Setting up necessary details
            mimeMessageHelper.setFrom("admin@gmail.com");
            mimeMessageHelper.setTo(emailDetail.getRecipient());
            mimeMessageHelper.setText(text, true);
            mimeMessageHelper.setSubject(emailDetail.getSubject());
            javaMailSender.send(mimeMessage);
        }catch (MessagingException messagingException){
            messagingException.printStackTrace();
        }
    }

    public void sendEmailWithAttachment(EmailDetail emailDetail, QRCodeData data) {
        try {
            Context context = new Context();
            context.setVariable("link", emailDetail.getLink());
            context.setVariable("button", emailDetail.getButtonValue());
            context.setVariable("name", emailDetail.getFullName());

            String text = templateEngine.process("emailtemplate", context);

            // Creating a simple mail message
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true); // Enable multipart mode

            // Setting up necessary details
            mimeMessageHelper.setFrom("admin@gmail.com");
            mimeMessageHelper.setTo(emailDetail.getRecipient());
            mimeMessageHelper.setText(text, true);
            mimeMessageHelper.setSubject(emailDetail.getSubject());

            BitMatrix bitMatrix = qrCodeService.generateQRCode(data);
            if (bitMatrix != null) {
                BufferedImage qrImage = QRCodeService.toBufferedImage(bitMatrix);
                byte[] qrBytes = QRCodeService.toByteArray(qrImage);

                mimeMessageHelper.addAttachment("qrCode.png", new ByteArrayDataSource(qrBytes, "image/png"));
            } else {
                System.out.println("QR code generation failed.");
            }

            javaMailSender.send(mimeMessage);
        } catch (MessagingException | IOException e) {
            e.printStackTrace();
        }
    }
    public void sendEmailReminder(Booking booking, List<BookingDetail> bookingDetails) throws MessagingException, IOException {
        Account account = booking.getAccount();
        QRCodeData data = new QRCodeData();
        data.setBookingId(booking.getBookingId());

        String subject = "Reminder: Your Booking for Tomorrow";
        StringBuilder message = new StringBuilder(String.format("Dear %s,\n\nThis is a reminder for your booking tomorrow. Please check your booking details:\n\n", account.getFullName()));

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        for (BookingDetail bookingDetail : bookingDetails) {
            message.append(String.format("Booking Detail \nDate: %s\nStart: %s  End: %s\n\n",
                     dateFormat.format(bookingDetail.getDate()), bookingDetail.getCourtTimeslot().getTimeslot().getStartTime(),bookingDetail.getCourtTimeslot().getTimeslot().getEndTime()));
        }

        message.append("Thank you,\nBadcourts Team");

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
        BitMatrix bitMatrix = qrCodeService.generateQRCode(data);
        if (bitMatrix != null) {
            BufferedImage qrImage = QRCodeService.toBufferedImage(bitMatrix);
            byte[] qrBytes = QRCodeService.toByteArray(qrImage);

            helper.addAttachment("qrCode.png", new ByteArrayDataSource(qrBytes, "image/png"));
        } else {
            System.out.println("QR code generation failed.");
        }

        helper.setTo(account.getEmail());
        helper.setSubject(subject);
        helper.setText(message.toString());

        javaMailSender.send(mimeMessage);


        logger.info("Sent email reminder to: {}", account.getEmail());
    }

}
