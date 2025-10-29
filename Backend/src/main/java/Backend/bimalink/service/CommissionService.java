package Backend.bimalink.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import Backend.bimalink.entity.Commission;
import Backend.bimalink.entity.Policy;
import Backend.bimalink.entity.Agent;
import Backend.bimalink.repository.CommissionRepository;
import Backend.bimalink.repository.AgentRepository;

import java.math.BigDecimal;

/**
 * Service for managing agent commissions.
 * Handles commission calculation and payment tracking.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CommissionService {
    private final CommissionRepository commissionRepository;
    private final AgentRepository agentRepository;

    /**
     * Calculate commission amount based on premium and rate
     * @param premiumAmount the premium amount
     * @param commissionRate the commission rate percentage
     * @return calculated commission amount
     */
    public BigDecimal calculateCommission(BigDecimal premiumAmount, BigDecimal commissionRate) {
        return premiumAmount.multiply(commissionRate).divide(new BigDecimal("100"));
    }

    /**
     * Create commission for a policy
     * @param policy the policy
     * @param agentId the agent ID
     * @param transactionId the transaction ID
     * @return the created commission
     */
    public Commission createCommission(Policy policy, Long agentId, Long transactionId) {
        Agent agent = agentRepository.findById(agentId)
            .orElseThrow(() -> new RuntimeException("Agent not found"));

        BigDecimal commissionAmount = calculateCommission(
            policy.getPremiumAmount(),
            agent.getCommissionRate()
        );

        Commission commission = Commission.builder()
            .agentId(agentId)
            .policyId(policy.getId())
            .transactionId(transactionId)
            .premiumAmount(policy.getPremiumAmount())
            .commissionRate(agent.getCommissionRate())
            .commissionAmount(commissionAmount)
            .status("PENDING")
            .build();

        Commission savedCommission = commissionRepository.save(commission);
        log.info("Commission created: {} for agent: {}", savedCommission.getId(), agentId);
        return savedCommission;
    }

    /**
     * Mark commission as paid
     * @param commissionId the commission ID
     */
    public void markCommissionAsPaid(Long commissionId) {
        Commission commission = commissionRepository.findById(commissionId)
            .orElseThrow(() -> new RuntimeException("Commission not found"));

        commission.setStatus("PAID");
        commission.setPaidAt(java.time.LocalDateTime.now());
        commissionRepository.save(commission);

        // Update agent statistics
        Agent agent = agentRepository.findById(commission.getAgentId())
            .orElseThrow(() -> new RuntimeException("Agent not found"));
        agent.setTotalCommissions(agent.getTotalCommissions().add(commission.getCommissionAmount()));
        agentRepository.save(agent);

        log.info("Commission {} marked as paid", commissionId);
    }
}
