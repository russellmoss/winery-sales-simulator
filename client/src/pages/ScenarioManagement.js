import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  getScenarios,
  addScenario,
  updateScenario,
  deleteScenario,
} from '../firebase/firestoreService';

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const KNOWLEDGE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const BUDGET_LEVELS = ['Low', 'Moderate', 'High'];
const FUNNEL_STAGES = ['awareness', 'consideration', 'decision'];

const VOICE_OPTIONS = [
  { id: 'ELEVENLABS_ANN_VOICE_ID', name: 'Ann' },
  { id: 'ELEVENLABS_GABRIELLA_VOICE_ID', name: 'Gabriella' },
  { id: 'ELEVENLABS_RUSSELL_VOICE_ID', name: 'Russell' },
  { id: 'ELEVENLABS_MIKE_VOICE_ID', name: 'Mike' }
];

const initialFormState = {
  title: '',
  description: '',
  difficulty: 'Beginner',
  voiceId: 'ELEVENLABS_ANN_VOICE_ID',
  wineryInfo: {
    name: '',
    location: '',
    specialties: [],
    uniqueFeatures: []
  },
  customerProfile: {
    names: ['', ''],
    homeLocation: '',
    occupation: '',
    visitReason: ''
  },
  clientPersonality: {
    knowledgeLevel: 'Beginner',
    budget: 'Moderate',
    traits: [],
    preferences: {
      favoriteWines: [],
      dislikes: [],
      interests: []
    }
  },
  behavioralInstructions: {
    generalBehavior: [],
    tastingBehavior: [],
    purchaseIntentions: []
  },
  funnelStage: 'awareness',
  objectives: [],
  evaluationCriteria: [],
  keyDocuments: [],
  initialContext: ''
};

const ScenarioManagement = () => {
  const [scenarios, setScenarios] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingScenario, setEditingScenario] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [newTrait, setNewTrait] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newCriterion, setNewCriterion] = useState('');
  const [newDocument, setNewDocument] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newFavoriteWine, setNewFavoriteWine] = useState('');
  const [newDislike, setNewDislike] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newGeneralBehavior, setNewGeneralBehavior] = useState('');
  const [newTastingBehavior, setNewTastingBehavior] = useState('');
  const [newPurchaseIntention, setNewPurchaseIntention] = useState('');

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const fetchedScenarios = await getScenarios();
      setScenarios(fetchedScenarios);
    } catch (error) {
      showSnackbar('Error fetching scenarios', 'error');
    }
  };

  const handleOpenDialog = (scenario = null) => {
    if (scenario) {
      setEditingScenario(scenario);
      setFormData({
        title: scenario.title || '',
        description: scenario.description || '',
        difficulty: scenario.difficulty || 'Beginner',
        voiceId: scenario.voiceId || 'ELEVENLABS_ANN_VOICE_ID',
        wineryInfo: {
          name: scenario.wineryInfo?.name || '',
          location: scenario.wineryInfo?.location || '',
          specialties: scenario.wineryInfo?.specialties || [],
          uniqueFeatures: scenario.wineryInfo?.uniqueFeatures || []
        },
        customerProfile: {
          names: scenario.customerProfile?.names || ['', ''],
          homeLocation: scenario.customerProfile?.homeLocation || '',
          occupation: scenario.customerProfile?.occupation || '',
          visitReason: scenario.customerProfile?.visitReason || ''
        },
        clientPersonality: {
          knowledgeLevel: (scenario.clientPersonality?.knowledgeLevel || 'Beginner').trim(),
          budget: (scenario.clientPersonality?.budget || 'Moderate').trim(),
          traits: scenario.clientPersonality?.traits || [],
          preferences: {
            favoriteWines: scenario.clientPersonality?.preferences?.favoriteWines || [],
            dislikes: scenario.clientPersonality?.preferences?.dislikes || [],
            interests: scenario.clientPersonality?.preferences?.interests || []
          }
        },
        behavioralInstructions: {
          generalBehavior: scenario.behavioralInstructions?.generalBehavior || [],
          tastingBehavior: scenario.behavioralInstructions?.tastingBehavior || [],
          purchaseIntentions: scenario.behavioralInstructions?.purchaseIntentions || []
        },
        funnelStage: scenario.funnelStage || 'awareness',
        objectives: scenario.objectives || [],
        evaluationCriteria: scenario.evaluationCriteria || [],
        keyDocuments: scenario.keyDocuments || [],
        initialContext: scenario.initialContext || ''
      });
    } else {
      setEditingScenario(null);
      setFormData({...initialFormState});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingScenario(null);
    setFormData({...initialFormState});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleArrayInputChange = (section, subsection, value) => {
    setFormData((prev) => {
      const path = section.split('.');
      if (path.length === 1) {
        // Handle non-nested paths
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subsection]: [...prev[section][subsection], value]
          }
        };
      } else {
        // Handle nested paths (e.g., 'clientPersonality.preferences')
        const [parentSection, childSection] = path;
        return {
          ...prev,
          [parentSection]: {
            ...prev[parentSection],
            [childSection]: {
              ...prev[parentSection][childSection],
              [subsection]: [...prev[parentSection][childSection][subsection], value]
            }
          }
        };
      }
    });
  };

  const handleRemoveArrayItem = (section, subsection, index) => {
    setFormData((prev) => {
      const path = section.split('.');
      if (path.length === 1) {
        // Handle non-nested paths
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subsection]: prev[section][subsection].filter((_, i) => i !== index)
          }
        };
      } else {
        // Handle nested paths (e.g., 'clientPersonality.preferences')
        const [parentSection, childSection] = path;
        return {
          ...prev,
          [parentSection]: {
            ...prev[parentSection],
            [childSection]: {
              ...prev[parentSection][childSection],
              [subsection]: prev[parentSection][childSection][subsection].filter((_, i) => i !== index)
            }
          }
        };
      }
    });
  };

  const handleAddTrait = () => {
    if (newTrait.trim()) {
      setFormData((prev) => ({
        ...prev,
        clientPersonality: {
          ...prev.clientPersonality,
          traits: [...prev.clientPersonality.traits, newTrait.trim()],
        },
      }));
      setNewTrait('');
    }
  };

  const handleRemoveTrait = (index) => {
    setFormData((prev) => ({
      ...prev,
      clientPersonality: {
        ...prev.clientPersonality,
        traits: prev.clientPersonality.traits.filter((_, i) => i !== index),
      },
    }));
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setFormData((prev) => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()],
      }));
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const handleAddCriterion = () => {
    if (newCriterion.trim()) {
      setFormData((prev) => ({
        ...prev,
        evaluationCriteria: [...prev.evaluationCriteria, newCriterion.trim()],
      }));
      setNewCriterion('');
    }
  };

  const handleRemoveCriterion = (index) => {
    setFormData((prev) => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria.filter((_, i) => i !== index),
    }));
  };

  const handleAddDocument = () => {
    if (newDocument.trim()) {
      setFormData((prev) => ({
        ...prev,
        keyDocuments: [...prev.keyDocuments, newDocument.trim()],
      }));
      setNewDocument('');
    }
  };

  const handleRemoveDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      keyDocuments: prev.keyDocuments.filter((_, i) => i !== index),
    }));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingScenario) {
        await updateScenario(editingScenario.id, formData);
        showSnackbar('Scenario updated successfully');
      } else {
        await addScenario(formData);
        showSnackbar('Scenario created successfully');
      }
      handleCloseDialog();
      fetchScenarios();
    } catch (error) {
      showSnackbar(
        `Error ${editingScenario ? 'updating' : 'creating'} scenario`,
        'error'
      );
    }
  };

  const handleDelete = async (scenarioId) => {
    if (window.confirm('Are you sure you want to delete this scenario?')) {
      try {
        await deleteScenario(scenarioId);
        showSnackbar('Scenario deleted successfully');
        fetchScenarios();
      } catch (error) {
        showSnackbar('Error deleting scenario', 'error');
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Scenario Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Scenario
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scenarios.map((scenario) => (
                <TableRow key={scenario.id}>
                  <TableCell>{scenario.title}</TableCell>
                  <TableCell>{scenario.description}</TableCell>
                  <TableCell>{scenario.difficulty}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(scenario)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(scenario.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingScenario ? 'Edit Scenario' : 'Create New Scenario'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" noValidate sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6">Basic Information</Typography>
                  <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    margin="normal"
                    multiline
                    rows={4}
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                    >
                      {DIFFICULTY_LEVELS.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Winery Information */}
                <Grid item xs={12}>
                  <Typography variant="h6">Winery Information</Typography>
                  <TextField
                    fullWidth
                    label="Winery Name"
                    name="wineryInfo.name"
                    value={formData.wineryInfo.name}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Winery Location"
                    name="wineryInfo.location"
                    value={formData.wineryInfo.location}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                  {/* Add specialties */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Specialties</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Add Specialty"
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (newSpecialty.trim()) {
                            handleArrayInputChange('wineryInfo', 'specialties', newSpecialty.trim());
                            setNewSpecialty('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.wineryInfo.specialties.map((specialty, index) => (
                        <Chip
                          key={index}
                          label={specialty}
                          onDelete={() => handleRemoveArrayItem('wineryInfo', 'specialties', index)}
                        />
                      ))}
                    </Box>
                  </Box>
                  {/* Add unique features */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Unique Features</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Add Feature"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (newFeature.trim()) {
                            handleArrayInputChange('wineryInfo', 'uniqueFeatures', newFeature.trim());
                            setNewFeature('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.wineryInfo.uniqueFeatures.map((feature, index) => (
                        <Chip
                          key={index}
                          label={feature}
                          onDelete={() => handleRemoveArrayItem('wineryInfo', 'uniqueFeatures', index)}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>

                {/* Customer Profile */}
                <Grid item xs={12}>
                  <Typography variant="h6">Customer Profile</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Customer Name 1"
                        value={formData.customerProfile.names[0]}
                        onChange={(e) => {
                          const newNames = [...formData.customerProfile.names];
                          newNames[0] = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            customerProfile: {
                              ...prev.customerProfile,
                              names: newNames
                            }
                          }));
                        }}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Customer Name 2"
                        value={formData.customerProfile.names[1]}
                        onChange={(e) => {
                          const newNames = [...formData.customerProfile.names];
                          newNames[1] = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            customerProfile: {
                              ...prev.customerProfile,
                              names: newNames
                            }
                          }));
                        }}
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    label="Home Location"
                    name="customerProfile.homeLocation"
                    value={formData.customerProfile.homeLocation}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Occupation"
                    name="customerProfile.occupation"
                    value={formData.customerProfile.occupation}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Visit Reason"
                    name="customerProfile.visitReason"
                    value={formData.customerProfile.visitReason}
                    onChange={handleInputChange}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>

                {/* Client Personality */}
                <Grid item xs={12}>
                  <Typography variant="h6">Client Personality</Typography>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Knowledge Level</InputLabel>
                    <Select
                      name="clientPersonality.knowledgeLevel"
                      value={formData.clientPersonality.knowledgeLevel}
                      onChange={handleInputChange}
                    >
                      {KNOWLEDGE_LEVELS.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Budget</InputLabel>
                    <Select
                      name="clientPersonality.budget"
                      value={formData.clientPersonality.budget}
                      onChange={handleInputChange}
                    >
                      {BUDGET_LEVELS.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Personality Traits */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Personality Traits</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Add Trait"
                        value={newTrait}
                        onChange={(e) => setNewTrait(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        onClick={handleAddTrait}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.clientPersonality.traits.map((trait, index) => (
                        <Chip
                          key={index}
                          label={trait}
                          onDelete={() => handleRemoveTrait(index)}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Wine Preferences */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Favorite Wines</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Add Favorite Wine"
                        value={newFavoriteWine}
                        onChange={(e) => setNewFavoriteWine(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (newFavoriteWine.trim()) {
                            handleArrayInputChange('clientPersonality.preferences', 'favoriteWines', newFavoriteWine.trim());
                            setNewFavoriteWine('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.clientPersonality.preferences.favoriteWines.map((wine, index) => (
                        <Chip
                          key={index}
                          label={wine}
                          onDelete={() => handleRemoveArrayItem('clientPersonality.preferences', 'favoriteWines', index)}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Wine Dislikes</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Add Dislike"
                        value={newDislike}
                        onChange={(e) => setNewDislike(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (newDislike.trim()) {
                            handleArrayInputChange('clientPersonality.preferences', 'dislikes', newDislike.trim());
                            setNewDislike('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.clientPersonality.preferences.dislikes.map((dislike, index) => (
                        <Chip
                          key={index}
                          label={dislike}
                          onDelete={() => handleRemoveArrayItem('clientPersonality.preferences', 'dislikes', index)}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Wine Interests</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Add Interest"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (newInterest.trim()) {
                            handleArrayInputChange('clientPersonality.preferences', 'interests', newInterest.trim());
                            setNewInterest('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.clientPersonality.preferences.interests.map((interest, index) => (
                        <Chip
                          key={index}
                          label={interest}
                          onDelete={() => handleRemoveArrayItem('clientPersonality.preferences', 'interests', index)}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>

                {/* Behavioral Instructions */}
                <Grid item xs={12}>
                  <Typography variant="h6">Behavioral Instructions</Typography>
                  
                  {/* General Behavior */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">General Behavior</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Add Behavior"
                        value={newGeneralBehavior}
                        onChange={(e) => setNewGeneralBehavior(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (newGeneralBehavior.trim()) {
                            handleArrayInputChange('behavioralInstructions', 'generalBehavior', newGeneralBehavior.trim());
                            setNewGeneralBehavior('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.behavioralInstructions.generalBehavior.map((behavior, index) => (
                        <Chip
                          key={index}
                          label={behavior}
                          onDelete={() => handleRemoveArrayItem('behavioralInstructions', 'generalBehavior', index)}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Tasting Behavior */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Tasting Behavior</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Add Behavior"
                        value={newTastingBehavior}
                        onChange={(e) => setNewTastingBehavior(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (newTastingBehavior.trim()) {
                            handleArrayInputChange('behavioralInstructions', 'tastingBehavior', newTastingBehavior.trim());
                            setNewTastingBehavior('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.behavioralInstructions.tastingBehavior.map((behavior, index) => (
                        <Chip
                          key={index}
                          label={behavior}
                          onDelete={() => handleRemoveArrayItem('behavioralInstructions', 'tastingBehavior', index)}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Purchase Intentions */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Purchase Intentions</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Add Intention"
                        value={newPurchaseIntention}
                        onChange={(e) => setNewPurchaseIntention(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (newPurchaseIntention.trim()) {
                            handleArrayInputChange('behavioralInstructions', 'purchaseIntentions', newPurchaseIntention.trim());
                            setNewPurchaseIntention('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.behavioralInstructions.purchaseIntentions.map((intention, index) => (
                        <Chip
                          key={index}
                          label={intention}
                          onDelete={() => handleRemoveArrayItem('behavioralInstructions', 'purchaseIntentions', index)}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>

                {/* Existing fields */}
                <Grid item xs={12}>
                  <Typography variant="h6">Additional Information</Typography>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Funnel Stage</InputLabel>
                    <Select
                      name="funnelStage"
                      value={formData.funnelStage}
                      onChange={handleInputChange}
                    >
                      {FUNNEL_STAGES.map((stage) => (
                        <MenuItem key={stage} value={stage}>
                          {stage}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Objectives */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Objectives</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Add Objective"
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        onClick={handleAddObjective}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.objectives.map((objective, index) => (
                        <Chip
                          key={index}
                          label={objective}
                          onDelete={() => handleRemoveObjective(index)}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Evaluation Criteria */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Evaluation Criteria</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Add Criterion"
                        value={newCriterion}
                        onChange={(e) => setNewCriterion(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        onClick={handleAddCriterion}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.evaluationCriteria.map((criterion, index) => (
                        <Chip
                          key={index}
                          label={criterion}
                          onDelete={() => handleRemoveCriterion(index)}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Key Documents */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Key Documents</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Add Document"
                        value={newDocument}
                        onChange={(e) => setNewDocument(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        onClick={handleAddDocument}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.keyDocuments.map((document, index) => (
                        <Chip
                          key={index}
                          label={document}
                          onDelete={() => handleRemoveDocument(index)}
                        />
                      ))}
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    label="Initial Context"
                    name="initialContext"
                    value={formData.initialContext}
                    onChange={handleInputChange}
                    margin="normal"
                    multiline
                    rows={4}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Voice</InputLabel>
                    <Select
                      name="voiceId"
                      value={formData.voiceId}
                      onChange={handleInputChange}
                    >
                      {VOICE_OPTIONS.map((voice) => (
                        <MenuItem key={voice.id} value={voice.id}>
                          {voice.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingScenario ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default ScenarioManagement; 