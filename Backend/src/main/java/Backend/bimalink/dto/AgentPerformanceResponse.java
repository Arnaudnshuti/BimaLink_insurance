package Backend.bimalink.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentPerformanceResponse {
    private Long agentId;
    private Integer totalPoliciesSold;
    private BigDecimal totalPremiums;
    private BigDecimal totalCommissions;
    private List<Map<String, Object>> last30DaysChart;
}
