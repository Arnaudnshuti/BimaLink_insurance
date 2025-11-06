package Backend.bimalink.repository;

import Backend.bimalink.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    Optional<Policy> findByPolicyNumber(String policyNumber);
    List<Policy> findByAgentId(Long agentId);
    List<Policy> findByCustomerId(Long customerId);
    
    @Query("SELECT p FROM Policy p WHERE p.agentId = :agentId AND p.status = :status")
    List<Policy> findByAgentIdAndStatus(@Param("agentId") Long agentId, @Param("status") String status);
}
