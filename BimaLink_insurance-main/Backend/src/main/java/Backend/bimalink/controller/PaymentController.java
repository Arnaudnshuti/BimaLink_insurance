package Backend.bimalink.controller;

import Backend.bimalink.dto.*;
import Backend.bimalink.entity.Policy;
import Backend.bimalink.entity.Transaction;
import Backend.bimalink.repository.PolicyRepository;
import Backend.bimalink.repository.TransactionRepository;
import Backend.bimalink.service.PaymentProviderClient;
import Backend.bimalink.service.CommissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Payment Controller
 * Handles payment initiation and callbacks from payment providers.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentProviderClient paymentProviderClient;
    private final TransactionRepository transactionRepository;
    private final PolicyRepository policyRepository;
    private final CommissionService commissionService;

    /**
     * Initiate payment for a policy
     */
    @PostMapping("/initiate")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_AGENT', 'ROLE_CUSTOMER')")
    public ResponseEntity<?> initiatePayment(@Valid @RequestBody PaymentInitiateRequest request) {
        try {
            Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy not found"));

            String transactionRef = "TXN_" + UUID.randomUUID().toString().toUpperCase();

            Transaction transaction = Transaction.builder()
                .transactionRef(transactionRef)
                .policyId(policy.getId())
                .customerId(policy.getCustomerId())
                .amount(request.getAmount())
                .status("PENDING")
                .paymentMethod(request.getPaymentMethod())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

            transactionRepository.save(transaction);

            // Initiate payment with provider
            Map<String, Object> providerResponse = paymentProviderClient.initiatePayment(
                request.getPhone(),
                request.getAmount(),
                transactionRef
            );

            // Update transaction with provider reference
            transaction.setProviderRef((String) providerResponse.get("providerRef"));
            transactionRepository.save(transaction);

            PaymentInitiateResponse response = PaymentInitiateResponse.builder()
                .transactionRef(transactionRef)
                .amount(request.getAmount())
                .status("PENDING")
                .paymentUrl((String) providerResponse.get("paymentUrl"))
                .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Payment initiation failed", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Payment initiation failed: " + e.getMessage()));
        }
    }

    /**
     * Payment callback endpoint (public, no auth required)
     * TODO: Implement HMAC signature validation
     */
    @PostMapping("/callback")
    public ResponseEntity<?> paymentCallback(@RequestBody PaymentCallbackRequest request) {
        try {
            log.info("Received payment callback: {}", request);

            Transaction transaction = transactionRepository.findByTransactionRef(request.getTransactionRef())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

            // TODO: Validate callback signature
            // if (!paymentProviderClient.validateCallbackSignature(request, request.getSignature())) {
            //     log.error("Invalid callback signature");
            //     return ResponseEntity.badRequest().build();
            // }

            // Update transaction
            transaction.setStatus(request.getStatus());
            transaction.setProviderRef(request.getProviderRef());
            transaction.setCallbackReceived(true);
            transaction.setUpdatedAt(LocalDateTime.now());

            if ("COMPLETED".equalsIgnoreCase(request.getStatus())) {
                transaction.setCompletedAt(LocalDateTime.now());
                transaction.setStatus("COMPLETED");

                // Update policy payment status
                Policy policy = policyRepository.findById(transaction.getPolicyId())
                    .orElse(null);
                if (policy != null) {
                    policy.setPaymentStatus("PAID");
                    policy.setStatus("ACTIVE");
                    policyRepository.save(policy);

                    // Create commission if policy has an agent
                    if (policy.getAgentId() != null) {
                        commissionService.createCommission(policy, policy.getAgentId(), transaction.getId());
                    }
                }
            }

            transactionRepository.save(transaction);

            return ResponseEntity.ok(Map.of("status", "success"));
        } catch (Exception e) {
            log.error("Payment callback processing failed", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Callback processing failed: " + e.getMessage()));
        }
    }
}
