import { Container } from "@mui/system";
import { Alert } from "@mui/material";

export default function SuccessPage(props) {
  return (
    <>
      <Container maxWidth="sm">
        <Alert severity="success">
            Registration Successful
        </Alert>
      </Container>
    </>
  );
}
