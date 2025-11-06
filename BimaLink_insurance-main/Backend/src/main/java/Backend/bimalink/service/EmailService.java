package Backend.bimalink.service;

/**
 * Service interface for sending emails.
 * Implementations should handle email delivery logic.
 */
public interface EmailService {
    /**
     * Send an OTP email to the user
     * @param to recipient email address
     * @param otp the OTP code to send
     */
    void sendOtpEmail(String to, String otp);
}
