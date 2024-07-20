package click.badcourt.be.model.response;


import click.badcourt.be.enums.TransactionEnum;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

@Data
public class TransactionUnderTopUpResponse {
    private Long transactionid;


    @DateTimeFormat(pattern="yyyy-MM-dd")
    private Date transactiondate;
    private TransactionEnum transactionstatus;
    private Double totalamount;
    private Long bookingid;

}
