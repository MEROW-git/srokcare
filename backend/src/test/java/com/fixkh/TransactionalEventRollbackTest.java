package com.fixkh;

import com.fixkh.dto.ReportEvent;
import com.fixkh.event.ReportDomainEvent;
import com.fixkh.event.ReportEventListener;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.transaction.support.DefaultTransactionStatus;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.Mockito.*;

public class TransactionalEventRollbackTest {

    @Configuration
    @EnableTransactionManagement
    static class TestConfig {
        @Bean
        public SimpMessagingTemplate messagingTemplate() {
            return mock(SimpMessagingTemplate.class);
        }

        @Bean
        public ReportEventListener reportEventListener(SimpMessagingTemplate messagingTemplate) {
            return new ReportEventListener(messagingTemplate);
        }

        @Bean
        public PlatformTransactionManager transactionManager() {
            return new AbstractPlatformTransactionManager() {
                @Override
                protected Object doGetTransaction() {
                    return new Object();
                }

                @Override
                protected void doBegin(Object transaction, org.springframework.transaction.TransactionDefinition definition) {}

                @Override
                protected void doCommit(DefaultTransactionStatus status) {}

                @Override
                protected void doRollback(DefaultTransactionStatus status) {}
            };
        }
    }

    @Test
    void rolledBackTransactionSendsNothing() {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TestConfig.class);
        try {
            SimpMessagingTemplate messaging = context.getBean(SimpMessagingTemplate.class);
            PlatformTransactionManager tm = context.getBean(PlatformTransactionManager.class);
            ApplicationEventPublisher publisher = context;

            // Start transaction
            TransactionStatus status = tm.getTransaction(new DefaultTransactionDefinition());

            // Publish event while transaction is active
            UUID reportId = UUID.randomUUID();
            publisher.publishEvent(new ReportDomainEvent("REPORT_CREATED", reportId, Instant.now()));

            // Roll back transaction
            tm.rollback(status);

            // Must NOT have broadcast anything
            verifyNoInteractions(messaging);
        } finally {
            context.close();
        }
    }

    @Test
    void committedTransactionBroadcastsEvent() {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TestConfig.class);
        try {
            SimpMessagingTemplate messaging = context.getBean(SimpMessagingTemplate.class);
            PlatformTransactionManager tm = context.getBean(PlatformTransactionManager.class);
            ApplicationEventPublisher publisher = context;

            // Start transaction
            TransactionStatus status = tm.getTransaction(new DefaultTransactionDefinition());

            // Publish event while transaction is active
            UUID reportId = UUID.randomUUID();
            publisher.publishEvent(new ReportDomainEvent("REPORT_CREATED", reportId, Instant.now()));

            // Commit transaction
            tm.commit(status);

            // Must broadcast to both public topics
            verify(messaging, times(1)).convertAndSend(eq("/topic/reports"), any(ReportEvent.class));
            verify(messaging, times(1)).convertAndSend(eq("/topic/reports/" + reportId), any(ReportEvent.class));
        } finally {
            context.close();
        }
    }
}
