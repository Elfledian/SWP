package click.badcourt.be.service;

import click.badcourt.be.entity.EmailDetail;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.File;

@Service
public class EmailService {

    @Autowired
    private TemplateEngine templateEngine;

    @Autowired
    private JavaMailSender javaMailSender;

    public void sendMailTemplate(EmailDetail emailDetail){
        try{
            Context context = new Context();

            context.setVariable("link",emailDetail.getLink());
            context.setVariable("button",emailDetail.getButtonValue());
            context.setVariable("name", emailDetail.getFullName());

            String text = templateEngine.process("emailtemplate", context);

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

    public void sendEmailWithAttachment(EmailDetail emailDetail, String attachmentPath) {
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

            File file = new File(attachmentPath);
            if (file.exists()) {
                mimeMessageHelper.addAttachment(file.getName(), file);
            } else {
                System.out.println("Attachment file not found: " + attachmentPath);
            }

            javaMailSender.send(mimeMessage);
        } catch (MessagingException messagingException) {
            messagingException.printStackTrace();
        }
    }
}
