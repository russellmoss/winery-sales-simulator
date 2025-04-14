import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getScenarios } from '../../firebase/firestoreService';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';

const ScenarioCard = styled(Paper)(({ theme }) => ({
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
  backgroundColor: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  position: 'relative'
}));

const ScenarioTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  marginBottom: '10px',
  color: '#333'
}));

const ScenarioDescription = styled(Typography)(({ theme }) => ({
  color: '#666',
  marginBottom: '15px'
}));

const ScenarioMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
  flexWrap: 'wrap',
  gap: '10px'
}));

const ScenarioDetails = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '15px',
  flexWrap: 'wrap'
}));

const ScenarioDetail = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  color: '#666',
  '& i': {
    color: theme.palette.primary.main
  }
}));

const StartButton = styled(Link)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '8px 16px',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'background-color 0.2s',
  marginTop: '10px',
  alignSelf: 'flex-start',
  textDecoration: 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    textDecoration: 'none'
  },
  '&:disabled': {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  }
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: '20px',
  color: '#666'
}));

const NoScenariosMessage = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  padding: '20px',
  color: '#666'
}));

function SimulatorHome() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        console.log('Starting to load scenarios...');
        setLoading(true);
        const scenariosData = await getScenarios();
        console.log('Scenarios loaded:', scenariosData);
        setScenarios(scenariosData);
      } catch (err) {
        console.error('Error in SimulatorHome:', err);
        setError(err.message);
      } finally {
        console.log('Finished loading scenarios, setting loading to false');
        setLoading(false);
      }
    };

    loadScenarios();
  }, []);

  const filteredScenarios = scenarios.filter(scenario => {
    if (difficultyFilter === 'all') return true;
    return scenario.difficulty?.trim().toLowerCase() === difficultyFilter.toLowerCase();
  });

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
        <Typography>Loading scenarios...</Typography>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className="simulator-home" sx={{ p: 2 }}>
      <Typography variant="h3" gutterBottom>Wine Sales Simulator</Typography>
      <Typography variant="subtitle1" gutterBottom>Practice your wine sales skills with AI-powered scenarios</Typography>

      {scenarios.length === 0 ? (
        <NoScenariosMessage>No scenarios available</NoScenariosMessage>
      ) : (
        scenarios.map((scenario) => (
          <ScenarioCard key={scenario.id}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <ScenarioTitle variant="h5">{scenario.title}</ScenarioTitle>
              <ScenarioDescription>{scenario.description}</ScenarioDescription>
              
              <ScenarioMeta>
                <ScenarioDetails>
                  <ScenarioDetail>
                    <i className="fas fa-signal" />
                    <span>{scenario.difficulty || 'Beginner'}</span>
                  </ScenarioDetail>
                  <ScenarioDetail>
                    <i className="fas fa-clock" />
                    <span>{scenario.estimatedDuration || '30'} minutes</span>
                  </ScenarioDetail>
                </ScenarioDetails>
              </ScenarioMeta>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <StartButton to={`/${scenario.id}/brief`}>
                  Start Scenario
                </StartButton>
              </Box>
            </Box>
          </ScenarioCard>
        ))
      )}
    </Box>
  );
}

export default SimulatorHome; 