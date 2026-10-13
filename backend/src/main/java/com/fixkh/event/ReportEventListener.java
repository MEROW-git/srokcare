package com.fixkh.event;

import com.fixkh.dto.ReportEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Listens for ReportDomainEvents and broadcasts public ReportEvent payloads
 * ONLY after the database transaction successfully commits.
 * Rolled-back or failed transactions will not broadcast any message.
 */
@Component
public class ReportEventListener {
    private final SimpMessagingTemplate messagingTemplate;

    public ReportEventListener(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onReportEvent(ReportDomainEvent event) {
        ReportEvent payload = new ReportEvent(event.eventType(), event.reportId(), event.timestamp());
        // Broadcast to general reports topic (feed, map, admin)
        messagingTemplate.convertAndSend("/topic/reports", payload);
        // Broadcast to report-specific topic (report details, comments, supports)
        messagingTemplate.convertAndSend("/topic/reports/" + event.reportId(), payload);
    }
}
