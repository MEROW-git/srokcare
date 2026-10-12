package com.fixkh.service;

import com.fixkh.exception.ApiException;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class RegistrationEmailSender {
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
        JavaMailSender sender = senders.getIfAvailable();
        if (host.isBlank() || sender == null || !validSender(from))
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Registration email is not configured");
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject("FixKH registration code");
        message.setText("Your FixKH registration code is " + code + ". It expires in 10 minutes. If you did not request it, ignore this email.");
        try {
            sender.send(message);
        } catch (MailException e) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Could not send registration email. Please try again later");
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
