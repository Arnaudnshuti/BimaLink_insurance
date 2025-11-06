package Backend.bimalink.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import Backend.bimalink.entity.User;
import Backend.bimalink.entity.UserOtp;
import Backend.bimalink.repository.UserRepository;
import Backend.bimalink.repository.UserOtpRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

/**
 * Service for handling OTP (One-Time Password) operations.
 * Manages OTP generation, storage, and verification.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {
    private final UserOtpRepository userOtpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;

    /**
     * Generate a random 6-digit OTP
     * @return the OTP string
     */
    private String generateOtp() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    /**
     * Create and send OTP to user's email
     * @param userId the user ID
     * @param email the user's email address
     * @return the plain OTP (for testing purposes)
     */
    public String createAndSendOtp(Long userId, String email) {
        String otp = generateOtp();
        String otpHash = org.springframework.security.crypto.bcrypt.BCrypt.hashpw(otp, 
            org.springframework.security.crypto.bcrypt.BCrypt.gensalt());

        UserOtp userOtp = UserOtp.builder()
            .userId(userId)
            .otpHash(otpHash)
            .email(email)
            .used(false)
            .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
            .build();

        userOtpRepository.save(userOtp);
        try {
            emailService.sendOtpEmail(email, otp);
        } catch (Exception e) {
            log.error("[MailError] Could not send OTP to {} ({}): {}", email, e.getClass().getSimpleName(), e.getMessage());
            throw e;
        }
        
        log.info("OTP created and sent to user {} with email {}", userId, email);
        return otp; // Return for testing - remove in production
    }

    /**
     * Verify OTP for a user
     * @param userId the user ID
     * @param email the user's email
     * @param otp the OTP to verify
     * @return true if OTP is valid and not expired, false otherwise
     */
    public boolean verifyOtp(Long userId, String email, String otp) {
        Optional<UserOtp> userOtpOpt = userOtpRepository
            .findLatestUnusedOtpForEmail(email, LocalDateTime.now());

        if (userOtpOpt.isEmpty()) {
            log.warn("No valid OTP found for email: {}", email);
            return false;
        }

        UserOtp userOtp = userOtpOpt.get();
        
        if (LocalDateTime.now().isAfter(userOtp.getExpiresAt())) {
            log.warn("OTP expired for email: {}", email);
            return false;
        }

        boolean isValid = org.springframework.security.crypto.bcrypt.BCrypt
            .checkpw(otp, userOtp.getOtpHash());

        if (isValid) {
            userOtp.setUsed(true);
            userOtpRepository.save(userOtp);
            log.info("OTP verified successfully for user {}", userId);
        }

        return isValid;
    }

    /**
     * Resend OTP to user's email
     * @param email the user's email
     * @return true if resend was successful, false otherwise
     */
    public boolean resendOtp(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.warn("User not found for email: {}", email);
            return false;
        }

        User user = userOpt.get();
        createAndSendOtp(user.getId(), email);
        log.info("OTP resent to email: {}", email);
        return true;
    }
}
