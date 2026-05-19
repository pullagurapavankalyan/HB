import React, { useContext, useEffect, useState } from 'react';
import { Container, Card, Row, Col, ProgressBar } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoyaltyDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loyaltyData, setLoyaltyData] = useState({ points: 0, tier: 'Bronze' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    // Simulate fetching loyalty data
    setTimeout(() => {
      setLoyaltyData({
        points: 1250,
        tier: 'Gold',
        nextTierPoints: 2000
      });
    }, 500);
  }, [user, navigate]);

  const progress = (loyaltyData.points / loyaltyData.nextTierPoints) * 100;

  return (
    <Container className="py-5" style={{ color: 'var(--text-color)' }}>
      <h2 className="mb-4">Loyalty Rewards</h2>
      <Row>
        <Col md={8} className="mx-auto">
          <Card style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} className="text-center shadow">
            <Card.Body className="p-5">
              <i className="bi bi-award-fill" style={{ fontSize: '4rem', color: 'var(--primary-color)' }}></i>
              <h3 className="mt-3">Current Tier: <strong>{loyaltyData.tier}</strong></h3>
              <h1 className="display-3 fw-bold mt-4" style={{ color: 'var(--primary-color)' }}>{loyaltyData.points}</h1>
              <p className="text-muted">Total Points Earned</p>
              
              <div className="mt-5 text-start">
                <div className="d-flex justify-content-between mb-2">
                  <span>{loyaltyData.points} pts</span>
                  <span>{loyaltyData.nextTierPoints} pts (Platinum)</span>
                </div>
                <ProgressBar now={progress} variant="warning" style={{ height: '10px' }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoyaltyDashboard;
