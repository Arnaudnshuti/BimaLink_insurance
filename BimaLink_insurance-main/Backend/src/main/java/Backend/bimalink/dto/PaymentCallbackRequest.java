package Backend.bimalink.dto;

import lombok.Data;

@Data
public class PaymentCallbackRequest {
    private String transactionRef;
    private String status;
    private String providerRef;
    private String message;
    private String signature;
}
