package Backend.bimalink.repository;

import Backend.bimalink.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AgentRepository extends JpaRepository<Agent, Long> {
    Optional<Agent> findByUserId(Long userId);
    Optional<Agent> findByAgentCode(String agentCode);
    List<Agent> findByStatus(String status);
    
    @Query("SELECT a FROM Agent a WHERE a.userId = :userId")
    Optional<Agent> findAgentByUserId(@Param("userId") Long userId);
}
