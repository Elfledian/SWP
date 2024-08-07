package click.badcourt.be.entity;

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

    private LocalTime startTime;
    private LocalTime endTime;

    @Column(nullable = false)
    boolean deleted;

    @OneToMany(mappedBy="timeslot")
    List<CourtTimeslot> courtTimeslots;
}
