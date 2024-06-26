package click.badcourt.be.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Time;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@Entity
@JsonIgnoreProperties({ "courts","account"})
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long clubId;

    String name;
    String address;
    LocalTime open_time;
    LocalTime close_time;
    String picture_location;
    double price;

    @OneToOne
    @JoinColumn(name = "Club_owner")
    Account account;

    @Column(nullable = false)
    boolean deleted;

    @OneToMany(mappedBy="club")
    List<Booking> bookings;

    @OneToMany(mappedBy = "club")
    List<Court> courts;

}

