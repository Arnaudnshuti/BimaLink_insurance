package Backend.bimalink.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "agents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Agent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "agent_code", unique = true, nullable = false, length = 20)
    private String agentCode;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(name = "nrc_number", length = 50)
    private String nrcNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "commission_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionRate = new BigDecimal("10.00");

    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "total_policies_sold")
    @Builder.Default
    private Integer totalPoliciesSold = 0;

    @Column(name = "total_premiums", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalPremiums = BigDecimal.ZERO;

    @Column(name = "total_commissions", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalCommissions = BigDecimal.ZERO;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
