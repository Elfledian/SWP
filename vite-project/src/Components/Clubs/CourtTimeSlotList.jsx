import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from "../../config/axios";
import "../css/CourtTimeSlotList.css";
import { Modal} from 'react-bootstrap';
import AddCourtTimeSlot from './AddCourtTimeSlot';
import '../css/AddCourtTimeSlots.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const CourtTimeSlotList = () => {
    const { courtId } = useParams();
    const [courtTimeSlots, setCourtTimeSlots] = useState([]);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const fecthCourtTimeSlot = async () => {
        try {
            const response = await api.get(`/courtTimeSlot/${courtId}`)
            setCourtTimeSlots(response.data)
            console.log(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fecthCourtTimeSlot()
    }, []);

    const handleAddCourtTimeSlot = () => {
        setShowModal(true);
    };

    const handleDeleteCourtTimeSlot = (courtTimeSlotId) => {
        api.delete(`/courtTimeSlot/${courtTimeSlotId}`)
            .then(response => {
                console.log(response.data);
                setCourtTimeSlots(courtTimeSlots.filter(courtTimeSlot => courtTimeSlot.courtTimeSlotId !== courtTimeSlotId));
            })
            .catch(error => console.error('Error deleting court time slot:', error));
    };

    return (
        <div className="center-div">
            <Link to={`/clubManage`}>
                <Button type="text">
                    <ArrowLeftOutlined /> Back
                </Button>
            </Link>
            <div className="center-content">
                <h1>Court Time Slots</h1>
                <button onClick={handleAddCourtTimeSlot} className="btn btn-primary">
                    Add CourtTimeSlot
                </button>
            </div>
            <div className="court-time-slot-list">
                {courtTimeSlots.map(courtTimeSlot => (
                    <div key={courtTimeSlot.courtTimeSlotId} className="time-slot">
                        <p><strong>Price:</strong> {courtTimeSlot.price}</p>
                        <p><strong>Start Time:</strong> {courtTimeSlot.start_time}</p>
                        <p><strong>End Time:</strong> {courtTimeSlot.end_time}</p>
                        <button onClick={() => handleDeleteCourtTimeSlot(courtTimeSlot.courtTimeSlotId)} className="btn btn-primary">
                            Delete CourtTimeSlot
                        </button>
                    </div>
                ))}
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Add Court Time Slot</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddCourtTimeSlot courtTimeSlots={courtTimeSlots} courtId={courtId} onClose={() => setShowModal(false)} onCourtTSAdded={fecthCourtTimeSlot} />
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default CourtTimeSlotList;

