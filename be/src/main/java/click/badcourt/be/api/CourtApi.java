package click.badcourt.be.api;

import click.badcourt.be.entity.Court;
import click.badcourt.be.model.request.CourtCreateRequest;
import click.badcourt.be.model.request.CourtUpdateRequest;
import click.badcourt.be.model.response.CourtResponse;
import click.badcourt.be.service.CourtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/court")
public class CourtApi {

    @Autowired
    private CourtService courtService;

    @GetMapping("/{clubId}")
    public ResponseEntity getCourtsByClubId(@PathVariable Long clubId){
        try {
            List<Court> courts = courtService.getCourtsByClubId(clubId);
            return ResponseEntity.ok(courts);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{clubId}")
    public ResponseEntity<?> addCourt(@RequestBody CourtCreateRequest courtCreateRequest, @PathVariable Long clubId){
        try {
            Court createdCourt = courtService.createCourt(courtCreateRequest, clubId);
            return ResponseEntity.ok(createdCourt);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteClub(@PathVariable Long id){
        courtService.deleteCourt(id);
        return ResponseEntity.ok( "courtID :"+id +" is deleted");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourt(@RequestBody CourtUpdateRequest courtUpdateRequest, @PathVariable long id){
        try {
            Court updatedCourt = courtService.updateCourt(courtUpdateRequest, id);
            CourtResponse court= new CourtResponse();
            court.setId(updatedCourt.getCourtId());
            court.setClubId(updatedCourt.getClub().getClub_id());
            court.setStatus(updatedCourt.getStatus());
            court.setPrice(updatedCourt.getPrice());

            return ResponseEntity.ok(court);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
