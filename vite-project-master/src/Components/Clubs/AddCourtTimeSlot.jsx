import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from "../../config/axios";
import { Button, Form } from 'react-bootstrap';
import '../css/AddCourt.css'; // Import CSS for styling the tags

const AddCourtTimeSlot = () => {
    const location = useLocation();
    const courtId = location.state ? location.state.courtId : null;
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

    useEffect(() => {
        if (!courtId) {
            alert('No courtId provided');
            return;
        }

        console.log(timeSlots);
        api.get('/timeslots')
            .then(response => setTimeSlots(response.data))
            .catch(error => console.error('Error fetching time slots:', error));
        console.log(timeSlots);
    }, [courtId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const courtTimeSlotRequest = { timeSlotId: selectedTimeSlot, courtId: Number(courtId) };
            console.log('Request payload:', courtTimeSlotRequest);
            await api.post(`/courtTimeSlot`, courtTimeSlotRequest);
            alert('Court time slot created successfully');
        } catch (error) {
            console.error('Error creating court time slot:', error);
            alert('Error creating court time slot');
        }
    };

    const handleTimeSlotClick = (timeSlotId) => {
        setSelectedTimeSlot(timeSlotId);
    };

    return (
        <div>
            <h1>Add Court Time Slot</h1>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicTimeSlots">
                    <Form.Label>Time Slots</Form.Label>
                    <div className="time-slot-tags">
                        {Array.isArray(timeSlots) && timeSlots.map(timeSlot => (
                            <span
                                key={timeSlot.timeslotId}
                                onClick={() => handleTimeSlotClick(timeSlot.timeslotId)}
                                className={`time-slot-tag ${selectedTimeSlot === timeSlot.timeslotId ? 'selected' : ''}`}
                            >
                                {`${timeSlot.start_time} - ${timeSlot.end_time}`}
                            </span>
                        ))}
                    </div>
                </Form.Group>
                <Button variant="warning" type="submit">
                    Submit
                </Button>
            </Form>
        </div>
    );
}

export default AddCourtTimeSlot;
