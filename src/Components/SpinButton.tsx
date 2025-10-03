import { Box, Text } from "@chakra-ui/react";

const SpinButton = () => {
  return (
    <Box
      w={["22vw", "18vw", "14vw"]} // responsive širina: 22% mob, 18% tablet, 14% desktop
      maxW="160px" // gornja granica da ne pređe previše
      aspectRatio="1 / 1" // uvijek savršen krug
      borderRadius="full"
      border="clamp(4px, 1vw, 8px) solid #FFF"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      {/* Background image */}
      <Box
        position="absolute"
        inset={0}
        bgImage="url('/SpinBackground.png')"
        bgSize="cover"
        bgPosition="center"
      />

      {/* Gradient overlay */}
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(180deg, #FFC02A 0%, #B37F00 100%)"
        mixBlendMode="color"
      />

      {/* Tekst */}
      <Text
        color="#FFF"
        textShadow="0 0 24px rgba(0, 0, 0, 0.8)"
        fontFamily="Jost, sans-serif"
        fontSize={["clamp(18px, 4vw, 28px)", "clamp(20px, 3vw, 32px)"]}
        fontWeight="800"
        lineHeight="1.2"
        textAlign="center"
        zIndex={1}
      >
        SPIN
      </Text>
    </Box>
  );
};

export default SpinButton;
