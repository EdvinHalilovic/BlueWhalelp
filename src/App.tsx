import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import Wheel from "./Components/Wheel";

const App: React.FC = () => {
  const [spinsLeft, setSpinsLeft] = useState(2);

  return (
    <Box
      w="100vw"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgImage="url('/blue-bg.png')"
      bgSize="cover"
      bgPos="center"
      bgRepeat="no-repeat"
    >
      <Box w="clamp(200px, 36vw, 460px)" aspectRatio="1/1">
        <Wheel spinsLeft={spinsLeft} setSpinsLeft={setSpinsLeft} />
      </Box>
    </Box>
  );
};

export default App;
