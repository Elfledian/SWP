package click.badcourt.be.entity;

import click.badcourt.be.enums.TransactionEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    private Double depositAmount;
    private Date paymentDate;
    private Double totalAmount;

    @OneToOne
    @JoinColumn(name="booking_id")
    Booking booking;

    @ManyToOne
    @JoinColumn(name = "fromaccount")
    Account fromaccount;

    @ManyToOne
    @JoinColumn(name = "toaccount")
    Account toaccount;

    @Enumerated(EnumType.STRING)
    TransactionEnum status;
}
