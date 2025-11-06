package Backend.bimalink.repository;

import Backend.bimalink.entity.UserOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserOtpRepository extends JpaRepository<UserOtp, Long> {
    List<UserOtp> findByUserId(Long userId);
    List<UserOtp> findByEmail(String email);
    
    @Query("SELECT otp FROM UserOtp otp WHERE otp.userId = :userId AND otp.used = false AND otp.expiresAt > :now ORDER BY otp.createdAt DESC")
    Optional<UserOtp> findLatestUnusedOtpForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);
    
    @Query("SELECT otp FROM UserOtp otp WHERE otp.email = :email AND otp.used = false AND otp.expiresAt > :now ORDER BY otp.createdAt DESC")
    Optional<UserOtp> findLatestUnusedOtpForEmail(@Param("email") String email, @Param("now") LocalDateTime now);
}
