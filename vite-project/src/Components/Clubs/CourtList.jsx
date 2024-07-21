import React, { useEffect, useState } from 'react';
import api from "../../config/axios";
import { useParams } from 'react-router-dom';
import { Card, Button, Pagination, Modal } from 'react-bootstrap';
import AddCourt from './AddCourt';
import { Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { ArrowLeftOutlined } from '@ant-design/icons';

const CourtList = () => {
    const { clubId } = useParams();
    const [courts, setCourts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [courtsPerPage] = useState(3); // Display only one card per row and limit the pagination to only have 3 cards
    const [showModal, setShowModal] = useState(false);
    const [showModal1, setShowModal1] = useState(false);
    const [selectedCourt, setSelectedCourt] = useState(null);
    const [newCourtName, setNewCourtName] = useState('');

    const fetchCourts = async () => {
        try {
            const response = await api.get(`/court/${clubId}`);
            setCourts(response.data);
        } catch (error) {
            console.error('Error fetching courts:', error);
        }
    };

    const handleUpdateCourt = async () => {
        try {
            const response = await api.put(`/court/${selectedCourt.id}`, { courtname: newCourtName });
            if (response.status === 200) {
                const updatedCourts = courts.map(court => {
                    if (court.id === selectedCourt.id) {
                        return { ...court, courtName: newCourtName };
                    }
                    return court;
                });
                setCourts(updatedCourts);
                setShowModal1(false);
            }
        } catch (error) {
            console.error('Error updating court:', error);
        }
    };


    const deleteCourt = async (id) => {
        try {
            await api.delete(`/court/${id}`);
            fetchCourts();
        } catch (error) {
            console.error('Error deleting court:', error);
        }
    };

    useEffect(() => {
        fetchCourts();
    }, []);

    const indexOfLastCourt = currentPage * courtsPerPage;
    const indexOfFirstCourt = indexOfLastCourt - courtsPerPage;
    const currentCourts = courts.slice(indexOfFirstCourt, indexOfLastCourt);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    return (
        <div>
            <div classname="contents" style={{ width: '70%', margin: '50px auto 0 auto' }}>
                <Link to={`/clubManage`}>
                    <Button type="text">
                        <ArrowLeftOutlined /> Back
                    </Button>
                </Link>
                <div className="courts">
                    <div className="court-list-container d-flex flex-wrap justify-content-center">
                        {currentCourts.length > 0 ? (
                            currentCourts.map((court) => (
                                <Card className="my-card" style={{ width: '80%', zIndex: '1', marginBottom: '20px' }} key={court.id}>
                                    <Card.Body>
                                        <Card.Title>{court.courtName}</Card.Title>
                                        <Card.Text>
                                            Club: {court.clubName}
                                        </Card.Text>
                                        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', marginTop: '10px', flexDirection: 'left' }}>
                                            <Button as={Link} to={`/showBooking/${court.id}`} size="sm" style={{ fontSize: '0.75rem' }}>View Booking</Button>
                                            <Button as={Link} to={`/clubManage/courtList/CourtsDetail/${court.id}`} size="sm" style={{ fontSize: '0.75rem' }}>View Time Slots</Button>
                                            <Button onClick={() => deleteCourt(court.id)} size="sm" style={{ fontSize: '0.75rem' }}>Delete</Button>
                                            <Button onClick={() => { setShowModal1(true); setSelectedCourt(court); setNewCourtName(court.courtName); }} size="sm" style={{ fontSize: '0.75rem' }}>Update Name</Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))
                        ) : (
                            <p>No court data available.</p>
                        )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Pagination>
                            {Array(Math.ceil(courts.length / courtsPerPage)).fill().map((_, idx) => (
                                <Pagination.Item key={idx + 1} active={idx + 1 === currentPage} onClick={() => paginate(idx + 1)}>
                                    {idx + 1}
                                </Pagination.Item>
                            ))}
                        </Pagination>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        Add Courts
                    </Button>
                </div>

            </div>

            <Modal show={showModal1} onHide={() => { setShowModal1(false); setNewCourtName(''); }}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Court Name</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>New Court Name</Form.Label>
                            <Form.Control type="text" placeholder="Enter new court name" value={newCourtName} onChange={(e) => setNewCourtName(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShowModal1(false); setNewCourtName(''); }}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleUpdateCourt}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Add Courts</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddCourt onClose={() => setShowModal(false)} onCourtAdded={fetchCourts} />


                </Modal.Body>
            </Modal>
        </div >
    );
}

export default CourtList;
