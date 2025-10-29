package Backend.bimalink.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;

/**
 * SMTP email service implementation using JavaMailSender.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SmtpEmailService implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String from;

    /**
     * Send OTP email via SMTP with a professional HTML template.
     */
    @Override
    public void sendOtpEmail(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject("BimaLink - Verify your email (OTP)");
            helper.setText(buildOtpPlain(otp), buildOtpHtml(otp));

            mailSender.send(message);
            log.info("OTP email sent to {}", to);
        } catch (Exception e) {
            log.error("[MailError] Failed to send OTP email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage(), e);
        }
    }

    private String buildOtpPlain(String otp) {
        return "Your BimaLink verification code is: " + otp + "\n\n" +
               "Enter this code in the app to verify your email.\n" +
               "This code expires in 10 minutes. If you didn’t request this, you can ignore this email.\n\n" +
               "— The BimaLink Team";
    }

    private String buildOtpHtml(String otp) {
        return "<!doctype html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "  <meta charset=\"utf-8\"/>" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>" +
                "  <title>BimaLink OTP Verification</title>" +
                "  <style>" +
                "    body{font-family:Arial,Helvetica,sans-serif;background:#f6f8fb;margin:0;padding:0;color:#222}" +
                "    .container{max-width:560px;margin:24px auto;background:#fff;border:1px solid #e6e9ef;border-radius:8px;overflow:hidden}" +
                "    .header{background:#0f62fe;color:#fff;padding:16px 20px;font-size:18px;font-weight:600}" +
                "    .content{padding:20px}" +
                "    .otp{font-size:28px;letter-spacing:6px;font-weight:700;color:#0f62fe;background:#eef4ff;border:1px dashed #b9d1ff;border-radius:6px;padding:12px 16px;text-align:center;margin:16px 0}" +
                "    .footer{padding:16px 20px;font-size:12px;color:#667085;border-top:1px solid #eef2f7}" +
                "    a{color:#0f62fe;text-decoration:none}" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class=\"container\">" +
                "    <div class=\"header\">BimaLink</div>" +
                "    <div class=\"content\">" +
                "      <p>Hello,</p>" +
                "      <p>Use the verification code below to confirm your email and finish signing in to BimaLink.</p>" +
                "      <div class=\"otp\">" + otp + "</div>" +
                "      <p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>" +
                "      <p>Thanks,<br/>The BimaLink Team</p>" +
                "    </div>" +
                "    <div class=\"footer\">" +
                "      You received this email because an OTP was requested for your account." +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }
}
