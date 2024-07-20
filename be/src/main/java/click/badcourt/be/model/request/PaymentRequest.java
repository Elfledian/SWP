package click.badcourt.be.model.request;

import lombok.Data;

@Data
public class PaymentRequest {
    private String amount;
    private String orderInfo;
    private String extraData;
}
