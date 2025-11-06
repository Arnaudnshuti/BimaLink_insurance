package Backend.bimalink.controller;

import Backend.bimalink.repository.AgentRepository;
import Backend.bimalink.entity.Agent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Agent Controller
 * Handles agent-related operations and performance metrics.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/agents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AgentController {
    private final AgentRepository agentRepository;

    /**
     * Get agent performance metrics
     */
    @GetMapping("/{id}/performance")
    public ResponseEntity<?> getAgentPerformance(@PathVariable Long id) {
        try {
            Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

            // Get total stats
            Integer totalPoliciesSold = agent.getTotalPoliciesSold();
            BigDecimal totalPremiums = agent.getTotalPremiums();
            BigDecimal totalCommissions = agent.getTotalCommissions();

            // Simplified response
            // TODO: Implement proper query aggregation for last 30 days chart points
            Map<String, Object> result = new HashMap<>();
            result.put("agentId", id);
            result.put("totalPoliciesSold", totalPoliciesSold);
            result.put("totalPremiums", totalPremiums);
            result.put("totalCommissions", totalCommissions);
            result.put("message", "Chart data aggregation pending - use policy repository queries");

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to get agent performance", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get agent performance: " + e.getMessage()));
        }
    }
}
