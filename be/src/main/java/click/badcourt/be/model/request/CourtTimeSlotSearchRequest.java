package click.badcourt.be.model.request;

import lombok.Data;

import java.util.Date;

@Data
public class CourtTimeSlotSearchRequest {
    Long CourtId;
    Date date;
}
