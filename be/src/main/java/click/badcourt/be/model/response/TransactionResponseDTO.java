package click.badcourt.be.model.response;

import click.badcourt.be.entity.Account;
import click.badcourt.be.enums.TransactionEnum;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

@Data
public class TransactionResponseDTO {
    private Long transactionID;
    private TransactionEnum transactionType;
    private Double amount;
    @DateTimeFormat(pattern="yyyy-MM-dd")
    private Date transactionDate;
    private Account from;
    private Account to;

}
