package com.fixkh;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fixkh.config.WebSocketConfig;
import com.fixkh.dto.ReportEvent;
import com.fixkh.event.ReportDomainEvent;
import com.fixkh.event.ReportEventListener;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class RealtimeEventTest {

    @Test
    void publicPayloadContainsOnlyNonSensitiveFields() {
        // Requirement: "Broadcast small event payloads containing an event type, report ID, and timestamp.
        // Never broadcast email addresses, tokens, OTPs, MFA data, or other private fields."
        Field[] fields = ReportEvent.class.getDeclaredFields();
        Set<String> allowedFieldNames = Set.of("eventType", "reportId", "timestamp");

        for (Field f : fields) {
            assertTrue(allowedFieldNames.contains(f.getName()),
                    "ReportEvent contains unauthorized field: " + f.getName());
        }

        // Verify JSON serialization output
        ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();
        UUID reportId = UUID.randomUUID();
        Instant now = Instant.now();
        ReportEvent event = new ReportEvent("REPORT_CREATED", reportId, now);

        JsonNode json = mapper.valueToTree(event);
        assertEquals(3, json.size(), "ReportEvent JSON should have exactly 3 fields");
        assertEquals("REPORT_CREATED", json.get("eventType").asText());
        assertEquals(reportId.toString(), json.get("reportId").asText());
        assertTrue(json.has("timestamp"));
        assertFalse(json.has("email"));
        assertFalse(json.has("token"));
        assertFalse(json.has("otp"));
        assertFalse(json.has("mfa"));
        assertFalse(json.has("author"));
    }

    @Test
    void eventListenerBroadcastsToGeneralAndSpecificTopics() {
        SimpMessagingTemplate messaging = mock(SimpMessagingTemplate.class);
        ReportEventListener listener = new ReportEventListener(messaging);

        UUID reportId = UUID.randomUUID();
        Instant now = Instant.now();
        ReportDomainEvent domainEvent = new ReportDomainEvent("REPORT_STATUS_CHANGED", reportId, now);

        listener.onReportEvent(domainEvent);

        ArgumentCaptor<String> destinationCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Object> payloadCaptor = ArgumentCaptor.forClass(Object.class);

        verify(messaging, times(2)).convertAndSend(destinationCaptor.capture(), payloadCaptor.capture());

        List<String> destinations = destinationCaptor.getAllValues();
        assertTrue(destinations.contains("/topic/reports"), "Must broadcast to general /topic/reports");
        assertTrue(destinations.contains("/topic/reports/" + reportId), "Must broadcast to /topic/reports/" + reportId);

        for (Object payload : payloadCaptor.getAllValues()) {
            assertInstanceOf(ReportEvent.class, payload);
            ReportEvent event = (ReportEvent) payload;
            assertEquals("REPORT_STATUS_CHANGED", event.eventType());
            assertEquals(reportId, event.reportId());
            assertEquals(now, event.timestamp());
        }
    }

    @Test
    void eventListenerHasAfterCommitAnnotation() throws NoSuchMethodException {
        // Requirement: "Send events only after the database transaction commits. A failed or rolled-back write must send nothing."
        Method method = ReportEventListener.class.getMethod("onReportEvent", ReportDomainEvent.class);
        TransactionalEventListener annotation = method.getAnnotation(TransactionalEventListener.class);

        assertNotNull(annotation, "ReportEventListener must be annotated with @TransactionalEventListener");
        assertEquals(TransactionPhase.AFTER_COMMIT, annotation.phase(),
                "@TransactionalEventListener must be configured for AFTER_COMMIT phase");
    }

    @Test
    void webSocketClientWritesAreForbidden() {
        // Requirement: "Clients may subscribe to public update topics, but must not perform writes through WebSocket."
        WebSocketConfig config = new WebSocketConfig();
        ChannelRegistration registration = new ChannelRegistration();
        config.configureClientInboundChannel(registration);

        // Extract the interceptor registered in ChannelRegistration
        // We test by inspecting interceptor behavior
        ArgumentCaptor<ChannelInterceptor> interceptorCaptor = ArgumentCaptor.forClass(ChannelInterceptor.class);
        ChannelRegistration mockRegistration = mock(ChannelRegistration.class);
        config.configureClientInboundChannel(mockRegistration);
        verify(mockRegistration).interceptors(interceptorCaptor.capture());

        ChannelInterceptor interceptor = interceptorCaptor.getValue();
        assertNotNull(interceptor);

        // Attempting a SEND frame must throw IllegalArgumentException
        StompHeaderAccessor sendAccessor = StompHeaderAccessor.create(StompCommand.SEND);
        sendAccessor.setDestination("/app/some-action");
        Message<byte[]> sendMessage = MessageBuilder.createMessage(new byte[0], sendAccessor.getMessageHeaders());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> interceptor.preSend(sendMessage, mock(MessageChannel.class)));
        assertTrue(ex.getMessage().contains("forbidden") || ex.getMessage().contains("writes"));

        // SUBSCRIBE and CONNECT frames must be permitted
        StompHeaderAccessor subscribeAccessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        subscribeAccessor.setDestination("/topic/reports");
        Message<byte[]> subscribeMessage = MessageBuilder.createMessage(new byte[0], subscribeAccessor.getMessageHeaders());

        Message<?> result = interceptor.preSend(subscribeMessage, mock(MessageChannel.class));
        assertNotNull(result, "SUBSCRIBE frame must be permitted");
    }
}
