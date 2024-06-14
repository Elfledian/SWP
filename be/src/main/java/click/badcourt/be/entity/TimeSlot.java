package click.badcourt.be.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@Entity
@JsonIgnoreProperties({"courtTimeslots"})
public class TimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long timeslotId;

    private LocalTime start_time;
    private LocalTime end_time;

    @JsonIgnore
    @Column(nullable = false)
    boolean deleted=false;

    @OneToMany(mappedBy="timeslot")
    List<CourtTimeslot> courtTimeslots;
}
