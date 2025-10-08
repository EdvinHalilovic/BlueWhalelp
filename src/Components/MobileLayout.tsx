import React from "react";
import { Box } from "@chakra-ui/react";
import Wheel from "./Wheel";
import SoundButton from "./SoundButton";

interface MobileLayoutProps {
  spinsLeft: number;
  setSpinsLeft: React.Dispatch<React.SetStateAction<number>>;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  spinsLeft,
  setSpinsLeft,
}) => {
  return (
    <Box
      w="100vw"
      h="100vh"
      position="relative"
      bgImage="url('/blue-bg.png')"
      bgSize="cover"
      bgPos="center"
      bgRepeat="no-repeat"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
    >
      <Box position="absolute" top="3vh" right="4vw" zIndex={10}>
        <SoundButton />
      </Box>
      {/* === Whale logo === */}
      <Box
        position="relative"
        zIndex={5}
        mt="4vh"
        mb="1vh"
        w="clamp(104px, 23vw, 208px)"
      >
        <img
          src="/whaleLogo.svg"
          alt="Whale.io Logo"
          style={{ width: "100%", height: "auto", objectFit: "contain" }}
        />
      </Box>

      {/* === Wheel === */}
      <Box
        position="relative"
        zIndex={4}
        w="clamp(260px, 82vw, 400px)"
        px="clamp(8px, 3vw, 20px)"
        mb="clamp(48px, 8vh, 80px)"
        mt="auto"
      >
        <Wheel spinsLeft={spinsLeft} setSpinsLeft={setSpinsLeft} />
      </Box>

      {/* === Character (širi za još 20%, bottom na 40%) === */}
      <Box
        position="absolute"
        bottom="35%" // 🔼 diže lika visoko iznad wheela
        left="50%"
        transform="translateX(-50%)"
        w="min(150vw, 780px)" // 🔼 20% širi (bio 125vw, sada 150vw)
        aspectRatio="501 / 450"
        zIndex={1}
        opacity={0.96}
        pointerEvents="none"
      >
        <img
          src="/RightCarachters.png"
          alt="Character"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            userSelect: "none",
          }}
        />
      </Box>
    </Box>
  );
};

export default MobileLayout;
