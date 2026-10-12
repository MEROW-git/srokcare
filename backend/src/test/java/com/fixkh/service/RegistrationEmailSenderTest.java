package com.fixkh.service;

import com.fixkh.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.mockito.ArgumentCaptor;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RegistrationEmailSenderTest {
    @Test void sendsOnlyTheCodeToTheRequestedAddress() {
        @SuppressWarnings("unchecked") ObjectProvider<JavaMailSender> providers = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(providers.getIfAvailable()).thenReturn(sender);
        new RegistrationEmailSender(providers, "smtp.example.com", "sender@example.com")
                .sendCode("citizen@example.com", "123456");
        ArgumentCaptor<SimpleMailMessage> message = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(sender).send(message.capture());
        assertArrayEquals(new String[] { "citizen@example.com" }, message.getValue().getTo());
        assertEquals("sender@example.com", message.getValue().getFrom());
        assertTrue(message.getValue().getText().contains("123456"));
    }

    @Test void rejectsMissingOrInvalidSenderConfiguration() {
        @SuppressWarnings("unchecked") ObjectProvider<JavaMailSender> providers = mock(ObjectProvider.class);
        when(providers.getIfAvailable()).thenReturn(mock(JavaMailSender.class));
        RegistrationEmailSender sender = new RegistrationEmailSender(providers, "", "not-an-email");
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, assertThrows(ApiException.class,
                () -> sender.sendCode("citizen@example.com", "123456")).getStatus());
    }
}
