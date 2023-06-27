import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Container } from "@mui/system";
import { getUser } from "../../helpers/api";
import Board from "../../components/Board";


export default function IndexPage(props) {
  const [cookies] = useCookies();
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    async function checkAuthenticated() {
      const token = cookies.token;
      let response = await getUser(token);

      if (!ignore) {
        if (!response.ok) {
          navigate('/sign-in');
          return;
        }

        let me = await response.json();
        props.setUser(me);
      }
    }
  
    checkAuthenticated();
  
    return () => {
      ignore = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.token]);

  return (
    <Container maxWidth="sm">
      <Board apiUrl={props.apiUrl} />
    </Container>
  );
}
