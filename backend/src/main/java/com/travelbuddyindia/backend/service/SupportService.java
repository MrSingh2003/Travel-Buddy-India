package com.travelbuddyindia.backend.service;

import com.travelbuddyindia.backend.model.SupportMessageEntity;
import com.travelbuddyindia.backend.repository.SupportMessageRepository;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

@Service
public class SupportService {

  private static final Logger log = LoggerFactory.getLogger(SupportService.class);

  private final SupportMessageRepository supportMessageRepository;
  private final JavaMailSender mailSender;

  private final String notificationEmailsCsv;
  private final String mailFrom;
  private final String smtpUsername;

  public SupportService(
      SupportMessageRepository supportMessageRepository,
      JavaMailSender mailSender,
      @Value("${support.notification.emails:}") @Nullable String notificationEmailsCsv,
      @Value("${support.mail.from:}") @Nullable String mailFrom,
      @Value("${spring.mail.username:}") @Nullable String smtpUsername) {
    this.supportMessageRepository = supportMessageRepository;
    this.mailSender = mailSender;
    this.notificationEmailsCsv = Objects.requireNonNullElse(notificationEmailsCsv, "");
    this.mailFrom = Objects.requireNonNullElse(mailFrom, "");
    this.smtpUsername = Objects.requireNonNullElse(smtpUsername, "");
  }

  @Transactional
  public SupportResponse submit(SupportRequest request, String ipAddress, String userAgent) {
    SupportMessageEntity entity = new SupportMessageEntity();
    entity.setName(request.name());
    entity.setEmail(request.email());
    entity.setSubject(request.subject());
    entity.setMessage(request.message());
    entity.setStatus("RECEIVED");
    entity.setIpAddress(ipAddress);
    entity.setUserAgent(userAgent);
    entity = supportMessageRepository.save(entity);

    List<String> recipients = parseRecipients(notificationEmailsCsv);
    if (recipients.isEmpty()) {
      // Fallback: if notification recipients env var isn't loaded,
      // still try to notify the sender identity configured for SMTP.
      String fallbackRecipient = !mailFrom.isBlank() ? mailFrom : smtpUsername;
      if (fallbackRecipient != null && !fallbackRecipient.isBlank()) {
        recipients = List.of(fallbackRecipient);
      }
    }

    if (recipients.isEmpty()) {
      entity.setStatus("EMAIL_NOT_CONFIGURED");
      supportMessageRepository.save(entity);
      return new SupportResponse(entity.getId(), entity.getStatus());
    }

    try {
      // Use HTML email so it remains readable in inboxes.
      String formattedBody =
          "<div>"
              + "<p><b>New Support Message</b></p>"
              + "<p><b>Name:</b> " + HtmlUtils.htmlEscape(request.name()) + "</p>"
              + "<p><b>Email:</b> " + HtmlUtils.htmlEscape(request.email()) + "</p>"
              + "<p><b>Subject:</b> " + HtmlUtils.htmlEscape(request.subject()) + "</p>"
              + "<p><b>Message:</b></p>"
              + "<div style='white-space:pre-wrap;border:1px solid #eee;padding:10px'>"
              + HtmlUtils.htmlEscape(request.message())
              + "</div>"
              + "<hr/>"
              + "<p><b>IP:</b> " + HtmlUtils.htmlEscape(nullToEmpty(ipAddress)) + "</p>"
              + "<p><b>User-Agent:</b> "
              + HtmlUtils.htmlEscape(nullToEmpty(userAgent))
              + "</p>"
              + "<p><b>Received:</b> "
              + entity.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
              + "</p>"
              + "</div>";

      MimeMessage mimeMessage = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");

      String from = mailFrom.isBlank() ? smtpUsername : mailFrom;
      if (from.isBlank()) {
        throw new IllegalStateException("Missing SMTP sender identity (set support.mail.from and/or spring.mail.username).");
      }
      helper.setFrom(from);
      helper.setTo(recipients.toArray(String[]::new));
      helper.setSubject("Support: " + request.subject());
      helper.setText(formattedBody, true);

      mailSender.send(mimeMessage);

      entity.setStatus("EMAIL_SENT");
      supportMessageRepository.save(entity);
      return new SupportResponse(entity.getId(), entity.getStatus());
    } catch (Exception ex) {
      log.warn("Failed to send support email", ex);
      entity.setStatus("EMAIL_FAILED");
      entity.setEmailError(truncate(ex.getMessage(), 1900));
      supportMessageRepository.save(entity);
      return new SupportResponse(entity.getId(), entity.getStatus());
    }
  }

  @Transactional(readOnly = true)
  public List<SupportSummary> listMessages() {
    return supportMessageRepository.findAllByOrderByCreatedAtDesc()
        .stream()
        .map(entity -> new SupportSummary(
            entity.getId(),
            entity.getName(),
            entity.getEmail(),
            entity.getSubject(),
            entity.getMessage(),
            entity.getStatus(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()))
        .toList();
  }

  private static String nullToEmpty(@Nullable String value) {
    return value == null ? "" : value;
  }

  private static List<String> parseRecipients(@Nullable String csv) {
    if (csv == null || csv.isBlank()) {
      return List.of();
    }
    return Arrays.stream(csv.split(","))
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .collect(Collectors.toCollection(ArrayList::new));
  }

  private static @Nullable String truncate(@Nullable String text, int maxLen) {
    if (text == null) {
      return null;
    }
    if (text.length() <= maxLen) {
      return text;
    }
    return text.substring(0, maxLen);
  }

  public record SupportRequest(
      @NotBlank String name,
      @Email @NotBlank String email,
      @NotBlank String subject,
      @NotBlank String message) {}

  public record SupportResponse(Long id, String status) {}

  public record SupportSummary(
      Long id,
      String name,
      String email,
      String subject,
      String message,
      String status,
      java.time.LocalDateTime createdAt,
      java.time.LocalDateTime updatedAt) {}
}
