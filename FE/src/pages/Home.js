import React from "react";
import styled from "styled-components";
import ProjectSide from "../components/ProjectSide";
import ButtonGo from "../atomics/ButtonGo";
import { useNavigate } from "react-router-dom";

function Home() {
  let navigate = useNavigate();
  const goSignIn = () => {
    navigate("/signin", { replace: false });
  };
  const goSignUp = () => {
    navigate("/signup", { replace: false });
  };
  return (
    <Container>
      <ProjectSide />
      <Main />
      <Section>
        <ButtonGo name="나만의 계획 만들기" onClickGo={goSignIn} />
        <ButtonGo name="추천계획 둘러보기" onClickGo={goSignUp} />
      </Section>
    </Container>
  );
}
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
`;

const Main = styled.div`
  width: 78vw;
  height: 100vh;
  background-image: url(/statics/images/main.png);
  background-size: cover;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  flexdirection: column;
`;

const Section = styled.section`
  width: 20vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
`;

export default Home;
