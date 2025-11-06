package Backend.bimalink.controller;

import Backend.bimalink.entity.Policy;
import Backend.bimalink.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Report Controller for regulator summaries.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class ReportController {
    private final PolicyRepository policyRepository;

    /**
     * Get daily report summary
     */
    @GetMapping("/daily")
    public ResponseEntity<?> getDailyReport() {
        try {
            LocalDate today = LocalDate.now();
            
            List<Policy> todayPolicies = policyRepository.findAll().stream()
                .filter(p -> p.getCreatedAt().toLocalDate().equals(today))
                .collect(Collectors.toList());

            Integer policyCount = todayPolicies.size();
            BigDecimal premiumsTotal = todayPolicies.stream()
                .map(Policy::getPremiumAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> result = new HashMap<>();
            result.put("date", today.toString());
            result.put("policyCount", policyCount);
            result.put("premiumsTotal", premiumsTotal);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to get daily report", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get daily report: " + e.getMessage()));
        }
    }
}
