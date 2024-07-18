package click.badcourt.be.model.response;

import click.badcourt.be.enums.TransactionEnum;
import lombok.Data;

import java.util.Date;

@Data
public class TransactionRechargeResponse {
    private Long transactionId;
    private Date transactionDate;
    private TransactionEnum transactionStatus;
    //private Float accountBalance;
    private Double totalAmount;
}
