import { Container, Typography, Box, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Something went wrong
        </Typography>
        <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
          An unexpected error occurred. Please try again.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ borderRadius: 2, fontWeight: 'bold', py: 1.2 }}
        >
          Go Home
        </Button>
      </Box>
    </Container>
  );
}
