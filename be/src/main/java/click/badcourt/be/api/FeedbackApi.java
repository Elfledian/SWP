package click.badcourt.be.api;
import click.badcourt.be.entity.FeedBack;
import click.badcourt.be.model.request.FeedbackCreateRequest;
import click.badcourt.be.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackApi {

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping
    public ResponseEntity<List<FeedBack>> getAllFeedback() {
        List<FeedBack> feedbacks = feedbackService.getAllFeedback();
        return new ResponseEntity<>(feedbacks, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedBack> getFeedbackById(@PathVariable Long id) {
        FeedBack feedback = feedbackService.getFeedbackById(id);
        return new ResponseEntity<>(feedback, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<FeedBack> createFeedback(@RequestBody FeedbackCreateRequest feedbackCreateRequest) {
        try {
            FeedBack feedback = feedbackService.createFeedback(feedbackCreateRequest);
            return new ResponseEntity<>(feedback, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

//    @PutMapping("/{id}")
//    public ResponseEntity<FeedBack> updateFeedback(@PathVariable Long id, @RequestBody FeedbackCreateRequest feedbackCreateRequest) {
//        try {
//            FeedBack updatedFeedback = feedbackService.updateFeedback(id, feedbackCreateRequest);
//            return new ResponseEntity<>(updatedFeedback, HttpStatus.OK);
//        } catch (IllegalArgumentException e) {
//            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
//        }
//    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        try {
            feedbackService.deleteFeedback(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
