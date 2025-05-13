import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const EditScenariosButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/scenarios/manage');
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<EditIcon />}
      onClick={handleClick}
      sx={{
        marginLeft: 2,
        '&:hover': {
          backgroundColor: 'primary.dark',
        },
      }}
    >
      Edit Scenarios
    </Button>
  );
};

export default EditScenariosButton; 