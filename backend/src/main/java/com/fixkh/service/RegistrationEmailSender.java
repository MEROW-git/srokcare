package com.fixkh.service;

import com.fixkh.exception.ApiException;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.event.TransactionalEventListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class RegistrationEmailSender {
    private static final Logger log = LoggerFactory.getLogger(RegistrationEmailSender.class);
    private final ObjectProvider<JavaMailSender> senders;
    private final String host;
    private final String from;

    public RegistrationEmailSender(ObjectProvider<JavaMailSender> senders,
            @Value("${spring.mail.host:}") String host,
            @Value("${fixkh.otp-sender-email:}") String from) {
        this.senders = senders;
        this.host = host;
        this.from = from;
    }

    public void sendCode(String recipient, String code) {
        send(recipient, "FixKH registration code", "Your FixKH registration code is " + code + ". It expires in 10 minutes. If you did not request it, ignore this email.");
    }

    public void sendPasswordResetCode(String recipient, String code) {
        send(recipient, "FixKH password reset code", "Your FixKH password reset code is " + code + ". It expires in 10 minutes. If you did not request it, ignore this email. Never share this code.");
    }

    public void sendPasswordChangedNotice(String recipient) {
        send(recipient, "Your FixKH password was changed", "Your FixKH password was changed. If you did not make this change, contact the FixKH team immediately.");
    }

    @Async("passwordResetEmailExecutor")
    @TransactionalEventListener
    public void onResetCodeRequested(PasswordResetService.ResetCodeEmail event) {
        try {
            sendPasswordResetCode(event.recipient(), event.code());
        } catch (RuntimeException error) {
            log.error("Password reset email delivery failed", error);
        }
    }

    @Async("passwordResetEmailExecutor")
    @TransactionalEventListener
    public void onPasswordChanged(PasswordResetService.PasswordChangedEmail event) {
        try {
            sendPasswordChangedNotice(event.recipient());
        } catch (RuntimeException error) {
            log.error("Password change notice delivery failed", error);
        }
    }

    private void send(String recipient, String subject, String body) {
        JavaMailSender sender = senders.getIfAvailable();
        if (host.isBlank() || sender == null || !validSender(from))
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Email is not configured");
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);
        try {
            sender.send(message);
        } catch (MailException e) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Could not send email. Please try again later");
        }
    }

    private boolean validSender(String address) {
        if (address == null || address.length() > 320) return false;
        try {
            jakarta.mail.internet.InternetAddress parsed = new jakarta.mail.internet.InternetAddress(address, true);
            parsed.validate();
            return address.equals(parsed.getAddress());
        } catch (jakarta.mail.internet.AddressException e) {
            return false;
        }
    }
}
