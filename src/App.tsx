import React, { useState } from "react";
import { Box, Image } from "@chakra-ui/react";
import Wheel from "./Components/Wheel";

const App: React.FC = () => {
  const [spinsLeft, setSpinsLeft] = useState(2);

  return (
    <Box
      w="100vw"
      h="100vh"
      position="relative"
      overflow="hidden"
      bgImage="url('/blue-bg.png')"
      bgSize="cover"
      bgPos="center"
      bgRepeat="no-repeat"
    >
      {/* === LEFT CHARACTER (još +15% širi, ukupno ~40%) === */}
      <Image
        src="/leftCharacter.png"
        alt="Character Left"
        position="absolute"
        left="0"
        bottom="0"
        transform="translateX(-15%)"
        w="clamp(580px, 82vw, 2000px)"
        h="92%"
        objectFit="contain"
        pointerEvents="none"
        zIndex={1}
        mt="clamp(10px, 3vh, 60px)"
        mb="clamp(-40px, -8vh, -100px)"
        sx={{
          "@media (max-width: 1400px)": {
            w: "clamp(520px, 78vw, 1600px)",
          },
          "@media (max-width: 1024px)": {
            w: "clamp(420px, 75vw, 1300px)",
            transform: "translateX(-6%)",
          },
          "@media (max-width: 768px)": {
            w: "clamp(340px, 85vw, 950px)",
            transform: "translateX(-4%)",
          },
          "@media (max-width: 480px)": {
            w: "clamp(280px, 95vw, 750px)",
            transform: "translateX(-3%)",
          },
        }}
      />

      {/* === RIGHT CHARACTER (+20% širi) === */}
      <Image
        src="/RightCarachters.png"
        alt="Character Right"
        position="absolute"
        right="0"
        bottom="0"
        transform="translateX(9%)"
        w="clamp(260px, 42vw, 1100px)" // 🔥 +20% širine
        h="105%"
        objectFit="contain"
        pointerEvents="none"
        zIndex={1}
        mb="clamp(-30px, -2vh, -60px)"
        mr="clamp(0px, 1.2vw, 40px)"
        sx={{
          "@media (max-width: 1200px)": {
            w: "clamp(230px, 40vw, 950px)",
            transform: "translateX(2%)",
          },
          "@media (max-width: 768px)": {
            w: "clamp(200px, 45vw, 800px)",
            transform: "translateX(1%)",
          },
          "@media (max-width: 480px)": {
            w: "clamp(180px, 60vw, 650px)",
            transform: "translateX(0%)",
          },
        }}
      />

      {/* === WHALE LOGO IZNAD SPINSBANNERA === */}
      <Box
        position="absolute"
        top="clamp(3%, 5vh, 7%)"
        left="50%"
        transform="translateX(-50%)"
        zIndex={5}
        w="clamp(70px, 8vw, 160px)"
        h="auto"
        sx={{
          "@media (max-height: 700px)": {
            top: "4%",
            w: "clamp(60px, 7vw, 130px)",
          },
          "@media (max-width: 480px)": {
            top: "6%",
            w: "clamp(55px, 12vw, 120px)",
          },
        }}
      >
        <Image
          src="/whaleLogo.svg"
          alt="Whale.io Logo"
          w="100%"
          h="auto"
          objectFit="contain"
          draggable={false}
          userSelect="none"
          sx={{
            transition: "transform 0.3s ease",
            "@media (max-width: 768px)": {
              transform: "scale(1.05)",
            },
            "@media (max-width: 480px)": {
              transform: "scale(1.1)",
            },
          }}
        />
      </Box>

      {/* === WHEEL CENTRIRAN === */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          w="clamp(240px, 30vw, 820px)"
          mx="auto"
          sx={{
            "@media (max-width: 480px)": {
              w: "clamp(240px, 75vw, 400px)",
            },
          }}
        >
          <Wheel spinsLeft={spinsLeft} setSpinsLeft={setSpinsLeft} />
        </Box>
      </Box>
    </Box>
  );
};

export default App;
