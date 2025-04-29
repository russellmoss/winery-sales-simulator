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
  ButtonGroup,
  Divider,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CodeIcon from '@mui/icons-material/Code';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  getScenarios,
  addScenario,
  updateScenario,
  deleteScenario,
} from '../firebase/firestoreService';
import { convertNarrativeToScenario } from '../services/claudeService';

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const KNOWLEDGE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const BUDGET_LEVELS = ['Low', 'Moderate', 'High'];
const FUNNEL_STAGES = ['awareness', 'consideration', 'decision'];

const VOICE_OPTIONS = [
  { id: process.env.REACT_APP_ELEVENLABS_ANN_VOICE_ID || 'dF9Efvf1yhy50ez0XcsR', name: 'Ann' },
  { id: process.env.REACT_APP_ELEVENLABS_GABRIELLA_VOICE_ID || 'gZxyH7932tdOwvzX8PFQ', name: 'Gabriella' },
  { id: process.env.REACT_APP_ELEVENLABS_RUSSELL_VOICE_ID || '2gpEexocpZxzUMhsKtta', name: 'Russell' },
  { id: process.env.REACT_APP_ELEVENLABS_MIKE_VOICE_ID || 'mwkkRsuaW4LoXOJdYHw5', name: 'Mike' }
];

const initialFormState = {
  title: '',
  description: '',
  difficulty: 'Beginner',
  voiceId: process.env.REACT_APP_ELEVENLABS_ANN_VOICE_ID || 'dF9Efvf1yhy50ez0XcsR',
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
  const [isLoading, setIsLoading] = useState(true);
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
  const [jsonFile, setJsonFile] = useState(null);
  const [jsonFileName, setJsonFileName] = useState('');
  const [narrativeText, setNarrativeText] = useState('');
  const [isProcessingNarrative, setIsProcessingNarrative] = useState(false);
  const [showNarrativeInput, setShowNarrativeInput] = useState(false);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    setIsLoading(true);
    try {
      const fetchedScenarios = await getScenarios();
      setScenarios(fetchedScenarios || []);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      showSnackbar('Error fetching scenarios', 'error');
      setScenarios([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (scenario = null) => {
    if (scenario) {
      setEditingScenario(scenario);
      setFormData({
        title: scenario.title || '',
        description: scenario.description || '',
        difficulty: scenario.difficulty || 'Beginner',
        voiceId: scenario.voiceId || process.env.REACT_APP_ELEVENLABS_ANN_VOICE_ID || 'dF9Efvf1yhy50ez0XcsR',
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
    setJsonFile(null);
    setJsonFileName('');
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

  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Constants for layout
      const margin = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - (2 * margin);
      const maxY = pageHeight - margin; // Maximum Y position before new page
      let yPos = margin;

      // Helper function to check if we need a new page
      const checkNewPage = (neededHeight) => {
        if (yPos + neededHeight > maxY) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Helper function to add text with wrapping and pagination
      const addWrappedText = (text, y, fontSize = 12) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;

        // Check if we need a new page
        if (y + totalHeight > maxY) {
          pdf.addPage();
          y = margin;
        }

        pdf.text(lines, margin, y);
        return y + totalHeight;
      };

      // Helper function to add a section with pagination
      const addSection = (title, content, y) => {
        // Add section title
        pdf.setFont(undefined, 'bold');
        pdf.setFontSize(14);
        const titleLines = pdf.splitTextToSize(title, contentWidth);
        const titleHeight = titleLines.length * (14 * 1.2);

        // Check if we need a new page for the title
        if (y + titleHeight > maxY) {
          pdf.addPage();
          y = margin;
        }

        pdf.text(titleLines, margin, y);
        y += titleHeight + 5;

        // Add section content
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(12);

        if (Array.isArray(content)) {
          content.forEach(item => {
            const itemLines = pdf.splitTextToSize(`• ${item}`, contentWidth);
            const itemHeight = itemLines.length * (12 * 1.2);

            if (y + itemHeight > maxY) {
              pdf.addPage();
              y = margin;
            }

            pdf.text(itemLines, margin, y);
            y += itemHeight + 5;
          });
        } else if (typeof content === 'object' && content !== null) {
          Object.entries(content).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              const keyLines = pdf.splitTextToSize(`${key}:`, contentWidth);
              const keyHeight = keyLines.length * (12 * 1.2);

              if (y + keyHeight > maxY) {
                pdf.addPage();
                y = margin;
              }

              pdf.text(keyLines, margin, y);
              y += keyHeight + 5;

              value.forEach(item => {
                const itemLines = pdf.splitTextToSize(`  • ${item}`, contentWidth);
                const itemHeight = itemLines.length * (12 * 1.2);

                if (y + itemHeight > maxY) {
                  pdf.addPage();
                  y = margin;
                }

                pdf.text(itemLines, margin, y);
                y += itemHeight + 5;
              });
            } else {
              const text = `${key}: ${value}`;
              const lines = pdf.splitTextToSize(text, contentWidth);
              const height = lines.length * (12 * 1.2);

              if (y + height > maxY) {
                pdf.addPage();
                y = margin;
              }

              pdf.text(lines, margin, y);
              y += height + 5;
            }
          });
        } else {
          const lines = pdf.splitTextToSize(content, contentWidth);
          const height = lines.length * (12 * 1.2);

          if (y + height > maxY) {
            pdf.addPage();
            y = margin;
          }

          pdf.text(lines, margin, y);
          y += height + 5;
        }

        return y + 10; // Add spacing after section
      };

      // Title
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(18);
      const titleLines = pdf.splitTextToSize(formData.title || 'Untitled Scenario', contentWidth);
      const titleHeight = titleLines.length * (18 * 1.2);

      if (yPos + titleHeight > maxY) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.text(titleLines, margin, yPos);
      yPos += titleHeight + 5;

      // Description
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(12);
      const descLines = pdf.splitTextToSize(formData.description || '', contentWidth);
      const descHeight = descLines.length * (12 * 1.2);

      if (yPos + descHeight > maxY) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.text(descLines, margin, yPos);
      yPos += descHeight + 10;

      // Add all sections
      yPos = addSection('Basic Information', {
        'Difficulty': formData.difficulty,
        'Funnel Stage': formData.funnelStage,
        'Voice': VOICE_OPTIONS.find(v => v.id === formData.voiceId)?.name || 'Ann'
      }, yPos);

      yPos = addSection('Winery Information', formData.wineryInfo, yPos);
      yPos = addSection('Customer Profile', formData.customerProfile, yPos);
      yPos = addSection('Client Personality', {
        'Knowledge Level': formData.clientPersonality.knowledgeLevel,
        'Budget': formData.clientPersonality.budget,
        'Traits': formData.clientPersonality.traits,
        'Preferences': formData.clientPersonality.preferences
      }, yPos);
      yPos = addSection('Behavioral Instructions', formData.behavioralInstructions, yPos);
      yPos = addSection('Objectives', formData.objectives, yPos);
      yPos = addSection('Evaluation Criteria', formData.evaluationCriteria, yPos);
      yPos = addSection('Key Documents', formData.keyDocuments, yPos);

      if (formData.initialContext) {
        yPos = addSection('Initial Context', formData.initialContext, yPos);
      }

      // Save the PDF
      pdf.save(`${formData.title || 'scenario'}.pdf`);
      showSnackbar('PDF exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showSnackbar('Error exporting PDF', 'error');
    }
  };

  const handleExportJSON = () => {
    try {
      const jsonString = JSON.stringify(formData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.title.replace(/\s+/g, '_')}_scenario.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      showSnackbar('Error exporting JSON', 'error');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setJsonFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        setJsonFile(jsonData);
        
        // Validate the JSON structure
        if (!jsonData.title || !jsonData.description) {
          showSnackbar('Invalid scenario format. JSON must include title and description.', 'error');
          return;
        }
        
        // Populate the form with the JSON data
        setFormData({
          title: jsonData.title || '',
          description: jsonData.description || '',
          difficulty: jsonData.difficulty || 'Beginner',
          voiceId: jsonData.voiceId || process.env.REACT_APP_ELEVENLABS_ANN_VOICE_ID || 'dF9Efvf1yhy50ez0XcsR',
          wineryInfo: {
            name: jsonData.wineryInfo?.name || '',
            location: jsonData.wineryInfo?.location || '',
            specialties: jsonData.wineryInfo?.specialties || [],
            uniqueFeatures: jsonData.wineryInfo?.uniqueFeatures || []
          },
          customerProfile: {
            names: jsonData.customerProfile?.names || ['', ''],
            homeLocation: jsonData.customerProfile?.homeLocation || '',
            occupation: jsonData.customerProfile?.occupation || '',
            visitReason: jsonData.customerProfile?.visitReason || ''
          },
          clientPersonality: {
            knowledgeLevel: (jsonData.clientPersonality?.knowledgeLevel || 'Beginner').trim(),
            budget: (jsonData.clientPersonality?.budget || 'Moderate').trim(),
            traits: jsonData.clientPersonality?.traits || [],
            preferences: {
              favoriteWines: jsonData.clientPersonality?.preferences?.favoriteWines || [],
              dislikes: jsonData.clientPersonality?.preferences?.dislikes || [],
              interests: jsonData.clientPersonality?.preferences?.interests || []
            }
          },
          behavioralInstructions: {
            generalBehavior: jsonData.behavioralInstructions?.generalBehavior || [],
            tastingBehavior: jsonData.behavioralInstructions?.tastingBehavior || [],
            purchaseIntentions: jsonData.behavioralInstructions?.purchaseIntentions || []
          },
          funnelStage: jsonData.funnelStage || 'awareness',
          objectives: jsonData.objectives || [],
          evaluationCriteria: jsonData.evaluationCriteria || [],
          keyDocuments: jsonData.keyDocuments || [],
          initialContext: jsonData.initialContext || ''
        });
        
        showSnackbar('JSON file loaded successfully', 'success');
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        showSnackbar('Error parsing JSON file. Please check the format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleNarrativeInputChange = (e) => {
    setNarrativeText(e.target.value);
  };

  const handleToggleNarrativeInput = () => {
    setShowNarrativeInput(!showNarrativeInput);
  };

  const handleProcessNarrative = async () => {
    if (!narrativeText.trim()) {
      showSnackbar('Please enter a narrative description', 'error');
      return;
    }

    setIsProcessingNarrative(true);
    try {
      const scenarioData = await convertNarrativeToScenario(narrativeText);
      // Ensure all array properties are initialized
      const processedScenarioData = {
        ...scenarioData,
        wineryInfo: {
          ...scenarioData.wineryInfo,
          specialties: scenarioData.wineryInfo?.specialties || [],
          uniqueFeatures: scenarioData.wineryInfo?.uniqueFeatures || []
        },
        customerProfile: {
          ...scenarioData.customerProfile,
          names: scenarioData.customerProfile?.names || ['', '']
        },
        clientPersonality: {
          ...scenarioData.clientPersonality,
          traits: scenarioData.clientPersonality?.traits || [],
          preferences: {
            ...scenarioData.clientPersonality?.preferences,
            favoriteWines: scenarioData.clientPersonality?.preferences?.favoriteWines || [],
            dislikes: scenarioData.clientPersonality?.preferences?.dislikes || [],
            interests: scenarioData.clientPersonality?.preferences?.interests || []
          }
        },
        behavioralInstructions: {
          ...scenarioData.behavioralInstructions,
          generalBehavior: scenarioData.behavioralInstructions?.generalBehavior || [],
          tastingBehavior: scenarioData.behavioralInstructions?.tastingBehavior || [],
          purchaseIntentions: scenarioData.behavioralInstructions?.purchaseIntentions || []
        },
        objectives: scenarioData.objectives || [],
        evaluationCriteria: scenarioData.evaluationCriteria || [],
        keyDocuments: scenarioData.keyDocuments || []
      };
      setFormData(processedScenarioData);
      showSnackbar('Narrative successfully converted to scenario', 'success');
      setShowNarrativeInput(false);
    } catch (error) {
      console.error('Error processing narrative:', error);
      showSnackbar('Error processing narrative: ' + error.message, 'error');
    } finally {
      setIsProcessingNarrative(false);
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : scenarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No scenarios found
                  </TableCell>
                </TableRow>
              ) : (
                scenarios.map((scenario) => (
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingScenario ? 'Edit Scenario' : 'Create New Scenario'}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <ButtonGroup variant="outlined" size="small">
                <Button
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handleExportPDF}
                  title="Export as PDF"
                >
                  Export PDF
                </Button>
                <Button
                  startIcon={<CodeIcon />}
                  onClick={handleExportJSON}
                  title="Export as JSON"
                >
                  Export JSON
                </Button>
                <Button
                  component="label"
                  startIcon={<UploadFileIcon />}
                  title="Upload JSON"
                >
                  Upload JSON
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={handleFileUpload}
                  />
                </Button>
                <Button
                  startIcon={<AutoFixHighIcon />}
                  onClick={handleToggleNarrativeInput}
                  title="Convert Narrative to Scenario"
                >
                  AI Convert
                </Button>
              </ButtonGroup>
            </Box>
            {jsonFileName && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'right' }}>
                Loaded: {jsonFileName}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Box component="form" noValidate sx={{ mt: 2 }}>
              {showNarrativeInput && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Narrative Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Describe your scenario in natural language. Include details about the winery, customers, 
                    their personalities, preferences, and any specific behaviors or objectives.
                  </Typography>
                  <TextField
                    fullWidth
                    label="Scenario Narrative"
                    multiline
                    rows={6}
                    value={narrativeText}
                    onChange={handleNarrativeInputChange}
                    margin="normal"
                    placeholder="Example: A couple from San Francisco visiting a boutique winery in Napa Valley. They are wine enthusiasts with intermediate knowledge, looking to expand their collection. The husband is interested in bold reds while the wife prefers lighter whites. They have a high budget and are considering joining the wine club..."
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleProcessNarrative}
                      disabled={isProcessingNarrative || !narrativeText.trim()}
                      startIcon={isProcessingNarrative ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
                    >
                      {isProcessingNarrative ? 'Processing...' : 'Convert to Scenario'}
                    </Button>
                  </Box>
                  <Divider sx={{ my: 3 }} />
                </>
              )}
              
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