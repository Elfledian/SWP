package click.badcourt.be.model.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RechargeRequestDTO {
    private Long bookingId;
    private String amount;
}
