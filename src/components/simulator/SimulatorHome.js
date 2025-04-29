import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulator } from '../../contexts/SimulatorContext';
import { fetchScenarios } from '../../firebase/firestoreService';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';

/**
 * SimulatorHome Component
 * 
 * This component serves as the landing page for the winery sales simulator.
 * It displays available scenarios and allows users to start a new simulation.
 */
const SimulatorHome = () => {
  const navigate = useNavigate();
  const { setCurrentScenario } = useSimulator();
  const [scenarios, setScenarios] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        console.log('Starting to load scenarios...');
        const fetchedScenarios = await fetchScenarios();
        setScenarios(fetchedScenarios);
        setError(null);
      } catch (err) {
        console.error('Error loading scenarios:', err);
        setError('Failed to load scenarios. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadScenarios();
  }, []);

  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const filteredScenarios = selectedDifficulty === 'all'
    ? scenarios
    : scenarios.filter(scenario => 
        scenario.difficulty === selectedDifficulty
      );

  const handleStartScenario = (scenario) => {
    setCurrentScenario(scenario);
    navigate('/simulator/chat');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'info';
      case 'advanced': return 'warning';
      case 'expert': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Winery Sales Simulator
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Choose a scenario to practice your wine sales skills. Each scenario presents unique challenges and learning opportunities.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Difficulty Level</InputLabel>
          <Select
            value={selectedDifficulty}
            label="Difficulty Level"
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            {difficulties.map((difficulty) => (
              <MenuItem key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filteredScenarios.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No scenarios found for the selected difficulty level.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredScenarios.map((scenario) => (
            <Grid item xs={12} md={6} key={scenario.id}>
              <Card 
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="h2">
                      {scenario.title}
                    </Typography>
                    <Chip 
                      label={scenario.difficulty}
                      color={getDifficultyColor(scenario.difficulty)}
                      size="small"
                    />
                  </Stack>
                  
                  <Typography color="text.secondary" paragraph>
                    {scenario.description}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Context:
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {scenario.context}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Objectives:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                    {scenario.objectives.map((objective, index) => (
                      <Typography 
                        component="li" 
                        key={index}
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {objective}
                      </Typography>
                    ))}
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleStartScenario(scenario)}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Start Scenario
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SimulatorHome; 