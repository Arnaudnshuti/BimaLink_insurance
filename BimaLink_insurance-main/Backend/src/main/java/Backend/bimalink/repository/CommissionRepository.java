package Backend.bimalink.repository;

import Backend.bimalink.entity.Commission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.math.BigDecimal;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, Long> {
    List<Commission> findByAgentId(Long agentId);
    List<Commission> findByPolicyId(Long policyId);
    List<Commission> findByAgentIdAndStatus(Long agentId, String status);
    
    @Query("SELECT SUM(c.commissionAmount) FROM Commission c WHERE c.agentId = :agentId AND c.status = :status")
    BigDecimal sumCommissionsByAgentAndStatus(@Param("agentId") Long agentId, @Param("status") String status);
}
