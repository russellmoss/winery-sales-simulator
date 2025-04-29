import React, { useState, useEffect } from 'react';
import { getScenarios, addScenario, updateScenario, deleteScenario } from '../../firebase/firestoreService';

const ScenarioManager = ({ onClose }) => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingScenario, setEditingScenario] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Template for new scenarios
  const newScenarioTemplate = {
    title: '',
    description: '',
    difficulty: 'Beginner',
    clientPersonality: {
      knowledgeLevel: 'Beginner',
      budget: 'Moderate',
      traits: []
    },
    objectives: [],
    evaluationCriteria: [],
    keyDocuments: []
  };

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const loadedScenarios = await getScenarios();
      setScenarios(loadedScenarios);
    } catch (err) {
      setError('Failed to load scenarios');
      console.error('Error loading scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scenarioId) => {
    if (!window.confirm('Are you sure you want to delete this scenario? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteScenario(scenarioId);
      setScenarios(scenarios.filter(s => s.id !== scenarioId));
    } catch (err) {
      setError('Failed to delete scenario');
      console.error('Error deleting scenario:', err);
    }
  };

  const handleEdit = (scenario) => {
    setEditingScenario({ ...scenario });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingScenario({ ...newScenarioTemplate });
    setIsCreating(true);
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        const newId = await addScenario(editingScenario);
        setScenarios([...scenarios, { ...editingScenario, id: newId }]);
      } else {
        await updateScenario(editingScenario.id, editingScenario);
        setScenarios(scenarios.map(s => 
          s.id === editingScenario.id ? editingScenario : s
        ));
      }
      setEditingScenario(null);
      setIsCreating(false);
    } catch (err) {
      setError(`Failed to ${isCreating ? 'create' : 'update'} scenario`);
      console.error('Error saving scenario:', err);
    }
  };

  const handleTraitChange = (index, value) => {
    const updatedTraits = [...editingScenario.clientPersonality.traits];
    if (index === updatedTraits.length) {
      updatedTraits.push(value);
    } else {
      updatedTraits[index] = value;
    }
    setEditingScenario({
      ...editingScenario,
      clientPersonality: {
        ...editingScenario.clientPersonality,
        traits: updatedTraits
      }
    });
  };

  const handleArrayChange = (field, index, value) => {
    const updatedArray = [...editingScenario[field]];
    if (index === updatedArray.length) {
      updatedArray.push(value);
    } else {
      updatedArray[index] = value;
    }
    setEditingScenario({
      ...editingScenario,
      [field]: updatedArray
    });
  };

  if (loading) {
    return <div className="loading">Loading scenarios...</div>;
  }

  return (
    <div className="scenario-manager">
      <div className="header">
        <h2>Manage Scenarios</h2>
        <div className="header-buttons">
          <button onClick={handleCreate} className="btn btn-primary">
            Create New Scenario
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {editingScenario ? (
        <div className="edit-form">
          <h3>{isCreating ? 'Create New Scenario' : 'Edit Scenario'}</h3>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={editingScenario.title}
              onChange={e => setEditingScenario({...editingScenario, title: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={editingScenario.description}
              onChange={e => setEditingScenario({...editingScenario, description: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Difficulty:</label>
            <select
              value={editingScenario.difficulty}
              onChange={e => setEditingScenario({...editingScenario, difficulty: e.target.value})}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label>Client Knowledge Level:</label>
            <select
              value={editingScenario.clientPersonality.knowledgeLevel}
              onChange={e => setEditingScenario({
                ...editingScenario,
                clientPersonality: {
                  ...editingScenario.clientPersonality,
                  knowledgeLevel: e.target.value
                }
              })}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div className="form-group">
            <label>Client Budget:</label>
            <select
              value={editingScenario.clientPersonality.budget}
              onChange={e => setEditingScenario({
                ...editingScenario,
                clientPersonality: {
                  ...editingScenario.clientPersonality,
                  budget: e.target.value
                }
              })}
            >
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-group">
            <label>Client Traits:</label>
            {editingScenario.clientPersonality.traits.map((trait, index) => (
              <div key={index} className="array-input">
                <input
                  type="text"
                  value={trait}
                  onChange={e => handleTraitChange(index, e.target.value)}
                />
                <button onClick={() => {
                  const newTraits = editingScenario.clientPersonality.traits.filter((_, i) => i !== index);
                  setEditingScenario({
                    ...editingScenario,
                    clientPersonality: {
                      ...editingScenario.clientPersonality,
                      traits: newTraits
                    }
                  });
                }}>✕</button>
              </div>
            ))}
            <button onClick={() => handleTraitChange(editingScenario.clientPersonality.traits.length, '')}>
              Add Trait
            </button>
          </div>

          <div className="form-group">
            <label>Objectives:</label>
            {editingScenario.objectives.map((objective, index) => (
              <div key={index} className="array-input">
                <input
                  type="text"
                  value={objective}
                  onChange={e => handleArrayChange('objectives', index, e.target.value)}
                />
                <button onClick={() => {
                  const newObjectives = editingScenario.objectives.filter((_, i) => i !== index);
                  setEditingScenario({...editingScenario, objectives: newObjectives});
                }}>✕</button>
              </div>
            ))}
            <button onClick={() => handleArrayChange('objectives', editingScenario.objectives.length, '')}>
              Add Objective
            </button>
          </div>

          <div className="form-group">
            <label>Evaluation Criteria:</label>
            {editingScenario.evaluationCriteria.map((criterion, index) => (
              <div key={index} className="array-input">
                <input
                  type="text"
                  value={criterion}
                  onChange={e => handleArrayChange('evaluationCriteria', index, e.target.value)}
                />
                <button onClick={() => {
                  const newCriteria = editingScenario.evaluationCriteria.filter((_, i) => i !== index);
                  setEditingScenario({...editingScenario, evaluationCriteria: newCriteria});
                }}>✕</button>
              </div>
            ))}
            <button onClick={() => handleArrayChange('evaluationCriteria', editingScenario.evaluationCriteria.length, '')}>
              Add Criterion
            </button>
          </div>

          <div className="form-group">
            <label>Key Documents:</label>
            {editingScenario.keyDocuments.map((doc, index) => (
              <div key={index} className="array-input">
                <input
                  type="text"
                  value={doc}
                  onChange={e => handleArrayChange('keyDocuments', index, e.target.value)}
                />
                <button onClick={() => {
                  const newDocs = editingScenario.keyDocuments.filter((_, i) => i !== index);
                  setEditingScenario({...editingScenario, keyDocuments: newDocs});
                }}>✕</button>
              </div>
            ))}
            <button onClick={() => handleArrayChange('keyDocuments', editingScenario.keyDocuments.length, '')}>
              Add Document
            </button>
          </div>

          <div className="button-group">
            <button onClick={handleSave} className="btn btn-primary">
              {isCreating ? 'Create Scenario' : 'Save Changes'}
            </button>
            <button onClick={() => setEditingScenario(null)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="scenarios-list">
          {scenarios.map(scenario => (
            <div key={scenario.id} className="scenario-item">
              <div className="scenario-info">
                <h3>{scenario.title}</h3>
                <p>{scenario.description}</p>
                <div className="scenario-meta">
                  <span>Difficulty: {scenario.difficulty}</span>
                  <span>Objectives: {scenario.objectives?.length || 0}</span>
                </div>
              </div>
              <div className="scenario-actions">
                <button onClick={() => handleEdit(scenario)} className="btn btn-primary">
                  Edit
                </button>
                <button onClick={() => handleDelete(scenario.id)} className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .scenario-manager {
          padding: 20px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .header-buttons {
          display: flex;
          gap: 10px;
        }
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .scenarios-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .scenario-item {
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .scenario-info {
          flex: 1;
        }
        .scenario-meta {
          display: flex;
          gap: 15px;
          color: #666;
          font-size: 0.9em;
        }
        .scenario-actions {
          display: flex;
          gap: 10px;
        }
        .edit-form {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        input, textarea, select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 5px;
        }
        textarea {
          min-height: 100px;
          resize: vertical;
        }
        .array-input {
          display: flex;
          gap: 10px;
          margin-bottom: 5px;
        }
        .array-input input {
          flex: 1;
          margin-bottom: 0;
        }
        .array-input button {
          padding: 0 10px;
          background: none;
          border: none;
          color: #dc3545;
          cursor: pointer;
        }
        .button-group {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          border: none;
        }
        .btn-primary {
          background-color: #28a745;
          color: white;
        }
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        .btn-danger {
          background-color: #dc3545;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ScenarioManager; 