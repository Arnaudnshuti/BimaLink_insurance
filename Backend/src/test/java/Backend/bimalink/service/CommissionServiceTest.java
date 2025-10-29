package Backend.bimalink.service;

import Backend.bimalink.entity.Agent;
import Backend.bimalink.entity.Commission;
import Backend.bimalink.entity.Policy;
import Backend.bimalink.repository.AgentRepository;
import Backend.bimalink.repository.CommissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CommissionService
 */
@ExtendWith(MockitoExtension.class)
class CommissionServiceTest {

    @Mock
    private CommissionRepository commissionRepository;

    @Mock
    private AgentRepository agentRepository;

    @InjectMocks
    private CommissionService commissionService;

    private Agent testAgent;
    private Policy testPolicy;

    @BeforeEach
    void setUp() {
        testAgent = Agent.builder()
            .id(1L)
            .agentCode("AG123456")
            .fullName("Test Agent")
            .commissionRate(new BigDecimal("10.00"))
            .totalCommissions(BigDecimal.ZERO)
            .build();

        testPolicy = Policy.builder()
            .id(1L)
            .policyNumber("POL123")
            .agentId(1L)
            .customerId(2L)
            .premiumAmount(new BigDecimal("1000.00"))
            .policyType("Health")
            .startDate(LocalDate.now())
            .endDate(LocalDate.now().plusYears(1))
            .status("ACTIVE")
            .build();
    }

    @Test
    void testCalculateCommission() {
        BigDecimal premium = new BigDecimal("1000.00");
        BigDecimal rate = new BigDecimal("10.00");

        BigDecimal commission = commissionService.calculateCommission(premium, rate);

        assertEquals(new BigDecimal("100.00"), commission);
    }

    @Test
    void testCreateCommission() {
        when(agentRepository.findById(1L)).thenReturn(Optional.of(testAgent));
        when(commissionRepository.save(any(Commission.class))).thenAnswer(invocation -> {
            Commission c = invocation.getArgument(0);
            c.setId(1L);
            return c;
        });

        Commission commission = commissionService.createCommission(testPolicy, 1L, 100L);

        assertNotNull(commission);
        assertEquals(new BigDecimal("100.00"), commission.getCommissionAmount());
        assertEquals("PENDING", commission.getStatus());
        verify(commissionRepository).save(any(Commission.class));
    }

    @Test
    void testMarkCommissionAsPaid() {
        Commission commission = Commission.builder()
            .id(1L)
            .agentId(1L)
            .policyId(1L)
            .premiumAmount(new BigDecimal("1000.00"))
            .commissionRate(new BigDecimal("10.00"))
            .commissionAmount(new BigDecimal("100.00"))
            .status("PENDING")
            .build();

        when(commissionRepository.findById(1L)).thenReturn(Optional.of(commission));
        when(agentRepository.findById(1L)).thenReturn(Optional.of(testAgent));
        when(commissionRepository.save(any(Commission.class))).thenReturn(commission);
        when(agentRepository.save(any(Agent.class))).thenReturn(testAgent);

        commissionService.markCommissionAsPaid(1L);

        assertEquals("PAID", commission.getStatus());
        assertNotNull(commission.getPaidAt());
        verify(commissionRepository).save(commission);
        verify(agentRepository).save(testAgent);
    }

    @Test
    void testCreateCommissionWithZeroRate() {
        testAgent.setCommissionRate(BigDecimal.ZERO);
        when(agentRepository.findById(1L)).thenReturn(Optional.of(testAgent));
        when(commissionRepository.save(any(Commission.class))).thenAnswer(invocation -> {
            Commission c = invocation.getArgument(0);
            c.setId(1L);
            return c;
        });

        Commission commission = commissionService.createCommission(testPolicy, 1L, 100L);

        assertNotNull(commission);
        assertEquals(BigDecimal.ZERO, commission.getCommissionAmount());
    }

    @Test
    void testCalculateCommissionLargeAmount() {
        BigDecimal premium = new BigDecimal("100000.00");
        BigDecimal rate = new BigDecimal("15.50");

        BigDecimal commission = commissionService.calculateCommission(premium, rate);

        assertEquals(new BigDecimal("15500.00"), commission);
    }
}
