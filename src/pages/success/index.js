import { Container, Typography, Box, Alert, Button } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';

export default function SuccessPage(props) {
  const navigate = useNavigate();

  return (
    <>
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Registration Successful
          </Typography>
          <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
            Your account has been created successfully. You can now sign in.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/sign-in')}
            sx={{ borderRadius: 2, fontWeight: 'bold', py: 1.2 }}
          >
            Sign In
          </Button>
        </Box>
      </Container>
    </>
  );
}
