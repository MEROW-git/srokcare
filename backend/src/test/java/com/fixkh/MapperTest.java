package com.fixkh;

import com.fixkh.entity.*;
import com.fixkh.mapper.ApiMapper;
import com.fixkh.repository.*;
import com.fixkh.security.CurrentUser;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MapperTest {
    @Test void publicReportHasNicknameAndDisplayableImageUrl() {
        ReportImageRepository images = mock(ReportImageRepository.class);
        CommentRepository comments = mock(CommentRepository.class);
        ReportSupportRepository supports = mock(ReportSupportRepository.class);
        CurrentUser current = mock(CurrentUser.class);
        User author = new User(); author.setNickname("សុខ Citizen");
        Report report = new Report(); report.setAuthor(author);
        ReportImage image = new ReportImage(); image.setReport(report);
        when(images.findByReportIdOrderByCreatedAt(report.getId())).thenReturn(List.of(image));
        when(current.optionalId()).thenReturn(Optional.empty());
        var response = new ApiMapper(images, comments, supports, current, "http://localhost:8080/").report(report);
        assertEquals("សុខ Citizen", response.authorNickname());
        assertEquals("http://localhost:8080/api/v1/reports/" + report.getId() + "/images/" + image.getId() + "/content", response.images().getFirst());
    }
}
