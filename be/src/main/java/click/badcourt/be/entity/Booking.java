package click.badcourt.be.entity;

import click.badcourt.be.enums.BookingStatusEnum;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({"feedback", "transaction"})
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date bookingDate;

    @ManyToOne
    @JoinColumn(name = "clubid")
    private Club club;

    @OneToOne(mappedBy = "booking")
    FeedBack feedback;

    @OneToMany(mappedBy = "booking")
    List<Transaction> transaction;

    @OneToMany(mappedBy = "booking")

    List<BookingDetail> bookingDetails;

    @ManyToOne
    @JoinColumn(name = "create_by")
    @JsonBackReference
    Account account;
    @ManyToOne
    @JoinColumn(name = "booking_type")
    BookingType bookingType;
    @Enumerated(EnumType.STRING)
    private BookingStatusEnum status;
}

