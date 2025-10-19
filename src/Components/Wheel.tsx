import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  useDisclosure,
  Box,
  Text,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import SpinButton from "./SpinButton";

interface WheelProps {
  spinsLeft: number;
  setSpinsLeft: React.Dispatch<React.SetStateAction<number>>;
}

const sectors = [
  { label: "FREE SPINS", color: "#FFAAE5" },
  { label: "TRY AGAIN", color: "#F027C8" },
  { label: "FREE SPINS", color: "#F5D4EB" },
  { label: "TRY AGAIN", color: "#E000B4" },
  { label: "FREE SPINS", color: "#FFAAE5" },
  { label: "TRY AGAIN", color: "#F027C8" },
];

/* ==== ANIMACIJE ==== */
const raysSpinCCW = keyframes`
  from { transform: rotate(0deg) scale(1.06); }
  to   { transform: rotate(-360deg) scale(1.06); }
`;
const raysSpinCW = keyframes`
  from { transform: rotate(0deg) scale(1.06); }
  to   { transform: rotate(360deg) scale(1.06); }
`;
const coreGlowPulse = keyframes`
  0%   { transform: scale(1);    opacity: .18; }
  50%  { transform: scale(1.04); opacity: .30; }
  100% { transform: scale(1);    opacity: .18; }
`;
const sparklesBlink = keyframes`
  0%,100% { opacity: .18; transform: translate3d(0,0,0); }
  50%     { opacity: .40; transform: translate3d(1px,-1px,0); }
`;

const Wheel: React.FC<WheelProps> = ({ spinsLeft, setSpinsLeft }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [angle, setAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [claimed, setClaimed] = useState(false);

  const sliceAngle = (2 * Math.PI) / sectors.length;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "r") {
        localStorage.removeItem("claimedPrize");
        localStorage.removeItem("remainingSpins");
        window.location.reload();
        console.log("🔄 Resetovan claimedPrize i remainingSpins");
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    localStorage.setItem("remainingSpins", spinsLeft.toString());
  }, [spinsLeft]);

  useEffect(() => {
    localStorage.setItem("claimedPrize", claimed.toString());
  }, [claimed]);

  const drawWheel = (rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const radius = size / 2;
    const centerX = size / 2;
    const centerY = size / 2;

    ctx.clearRect(0, 0, size, size);

    sectors.forEach((sector, i) => {
      const startAngle = i * sliceAngle + rotation;
      const endAngle = startAngle + sliceAngle;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      if (sector.label === "FREE SPINS") {
        const gradient = ctx.createLinearGradient(
          centerX,
          centerY - radius,
          centerX,
          centerY + radius
        );
        gradient.addColorStop(0, "#FFE4A3");
        gradient.addColorStop(1, "#FEEFCB");
        ctx.fillStyle = gradient;
      } else {
        const gradient = ctx.createLinearGradient(
          centerX,
          centerY - radius,
          centerX,
          centerY + radius
        );
        gradient.addColorStop(0, "#FFC02A");
        gradient.addColorStop(1, "#B37F00");
        ctx.fillStyle = gradient;
      }

      ctx.fill();

      ctx.save();
      ctx.translate(centerX, centerY);

      const angleRad = startAngle + sliceAngle / 2;
      const textRadius = radius - size / 5.2;
      const x = Math.cos(angleRad) * textRadius;
      const y = Math.sin(angleRad) * textRadius;

      ctx.textAlign = "center";
      const fontSize = Math.max(18, Math.min(size / 15, 32));
      ctx.font = `800 ${fontSize}px Jost`;
      ctx.textBaseline = "middle";

      if (sector.label === "TRY AGAIN") {
        ctx.fillStyle = "#FFF";
        ctx.fillText("TRY", x, y - fontSize / 2);
        ctx.fillText("AGAIN", x, y + fontSize / 1.2);
      } else {
        const textGradient = ctx.createLinearGradient(
          x,
          y - fontSize,
          x,
          y + fontSize
        );
        textGradient.addColorStop(0, "#FFC02A");
        textGradient.addColorStop(1, "#B37F00");
        ctx.fillStyle = textGradient;
        ctx.fillText("FREE", x, y - fontSize / 2);
        ctx.fillText("SPINS", x, y + fontSize / 1.2);
      }

      ctx.restore();
    });
  };

  useEffect(() => {
    drawWheel(angle);
  }, [angle]);

  const spin = () => {
    if (spinsLeft <= 0 || isSpinning || claimed) return;

    setIsSpinning(true);
    const next = spinCount + 1;
    setSpinCount(next);

    const startAngle = angle;

    // odredi na koji sektor treba stati
    const targetIndex = next === 1 ? 1 : 0;
    let targetAngle = targetIndex * sliceAngle;
    if (next === 1) targetAngle += sliceAngle / 6;

    const pointerOffset = -Math.PI / 2;
    const extraSpins = 5 * 2 * Math.PI;
    const finalAngle = extraSpins + pointerOffset - targetAngle;

    // === ANIMACIJA SA CUBIC BEZIER ===
    const duration = 4000; // 4 sekunde trajanje
    const totalFrames = duration / 16; // ~60 fps
    let frame = 0;

    // easing funkcija (cubic-bezier(0.25, 1, 0.5, 1))
    const easeOutCubicBezier = (t: number) => {
      return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 5);
    };

    const interval = setInterval(() => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = easeOutCubicBezier(progress);
      const currentRotation = startAngle + finalAngle * eased;
      setAngle(currentRotation);

      if (progress >= 1) {
        clearInterval(interval);
        setIsSpinning(false);
        setSpinsLeft((p) => Math.max(p - 1, 0));

        if (next === 2) {
          setTimeout(() => onOpen(), 750);
        }
      }
    }, 16);
  };

  const alwaysOpen = claimed;

  return (
    <Box
      position="relative"
      w="100%"
      maxW={["400px", "600px", "900px"]}
      aspectRatio="1/1"
      mx="auto"
      mb={["20px", "40px", "60px"]}
      mt="clamp(150px, 34vh, 500px)"
    >
      {/* === SPINS BANNER === */}
      {/* === SPINS BANNER === */}
      <Box
        position="absolute"
        top={["-32%", "-28%", "-30%"]} // desktop i tablet
        left="50%"
        transform="translateX(-50%)"
        w={["80vw", "70vw", "min(60vw, 420px)"]}
        maxW="500px"
        aspectRatio="16 / 9"
        zIndex={-1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          "@media (max-width: 480px)": {
            transform: "translateX(-50%) scale(0.9, 1.3)", // 🔥 +15% širi, +30% viši
            transformOrigin: "center top",
            top: "-43%", // zadržavamo fino iznad wheela
          },
        }}
      >
        <Box
          as="img"
          src="/SpinsBanner.png"
          alt="Spins Banner Background"
          w="100%"
          h="auto"
          objectFit="contain"
          objectPosition="center top"
          draggable={false}
          userSelect="none"
        />
      </Box>

      {/* === TEKST === */}
      <Box
        position="absolute"
        top={["-19%", "-17%", "-14%"]}
        left="50%"
        transform="translateX(-50%)"
        zIndex={2}
        textAlign="center"
        w="100%"
        mt="clamp(-45px, -2.5vw, -35px)"
      >
        <Text
          color="#FFFFFF"
          fontFamily="Jost, sans-serif"
          fontWeight="800"
          fontSize="clamp(0.9rem, 1.8vw, 1.2rem)"
          letterSpacing="0.05em"
          mb="0.2rem"
          display="inline-block"
          px="0.8rem"
          py="0.2rem"
          borderRadius="0.4rem"
        >
          YOU GOT
        </Text>

        <Text
          bgGradient="linear(90deg, #FFF2D2 0%, #F8D276 100%)"
          bgClip="text"
          color="transparent"
          fontFamily="Jost, sans-serif"
          fontWeight="800"
          fontSize="clamp(1.4rem, 2.5vw, 2rem)"
        >
          {spinsLeft} SPINS LEFT
        </Text>
      </Box>

      {/* === CANVAS WHEEL === */}
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          zIndex: 1,
        }}
      />

      {/* === RING OVERLAY === */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="100%"
        h="100%"
        pointerEvents="none"
      >
        <Box position="relative" w="100%" h="100%">
          <Box
            as="img"
            src="/wheel-ring.svg"
            alt="Wheel Ring"
            w="100%"
            h="100%"
            objectFit="contain"
          />
          <Box
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            bgGradient="linear(180deg, #F8D378 0%, #E29F2A 100%)"
            mixBlendMode="color"
            style={{
              WebkitMaskImage: "url(/wheel-ring.svg)",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
            }}
          />
        </Box>
      </Box>

      {/* === SPIN BUTTON === */}
      <Box
        onClick={spinsLeft > 0 && !isSpinning ? spin : undefined}
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        cursor={spinsLeft > 0 && !isSpinning ? "pointer" : "not-allowed"}
        opacity={spinsLeft > 0 ? 1 : 0.5}
      >
        <SpinButton />
      </Box>

      {/* === POINTER === */}
      <img
        src="/YellowGroup.svg"
        alt="pointer"
        style={{
          position: "absolute",
          top: "-6%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "12%",
          height: "auto",
        }}
      />

      {/* === WINNING MODAL === */}
      <Modal
        isOpen={alwaysOpen || isOpen}
        onClose={() => {
          if (!claimed) {
            setClaimed(false);
            onClose();
          }
        }}
        isCentered
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <ModalOverlay bg="rgba(0,0,0,0.7)" />

        <ModalContent
          position="relative"
          w="100vw"
          maxW="100vw"
          h="100dvh"
          maxH="100dvh"
          bg="transparent"
          boxShadow="none"
          borderRadius="0"
          overflow="hidden"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* === ANIMIRANA POZADINA === */}
          <Box
            position="absolute"
            inset={0}
            zIndex={0}
            backgroundImage="url(/sun-rayBG.png)"
            backgroundSize="120% 120%"
            backgroundPosition="center"
            mixBlendMode="screen"
            opacity={0.2}
            animation={`${raysSpinCCW} 36s linear infinite`}
          />
          <Box
            position="absolute"
            inset={0}
            zIndex={0}
            backgroundImage="url(/sun-rayBG.png)"
            backgroundSize="120% 120%"
            backgroundPosition="center"
            mixBlendMode="screen"
            opacity={0.2}
            animation={`${raysSpinCW} 36s linear infinite`}
          />
          <Box
            position="absolute"
            inset={0}
            zIndex={1}
            bg="radial-gradient(circle at 50% 50%, rgba(255,235,180,0.35) 0%, rgba(255,214,120,0.22) 40%, rgba(255,190,90,0.10) 65%, rgba(255,190,90,0) 78%)"
            animation={`${coreGlowPulse} 2.8s ease-in-out infinite`}
          />
          <Box
            position="absolute"
            inset={0}
            zIndex={1}
            backgroundImage={`radial-gradient(circle, rgba(255,255,255,0.9) 0 2px, rgba(255,255,255,0) 3px),
              radial-gradient(circle, rgba(255,200,255,0.8) 0 2px, rgba(255,255,255,0) 3px)`}
            backgroundSize="240px 240px, 200px 200px"
            backgroundPosition="22% 32%, 68% 46%"
            mixBlendMode="screen"
            animation={`${sparklesBlink} 3s ease-in-out infinite`}
          />

          <Box
            as="img"
            src="/blueWinningModal.png"
            alt="Winning Frame"
            position="absolute"
            inset="0"
            w="100%"
            h="100%"
            objectFit="contain"
            pointerEvents="none"
            zIndex={2}
            sx={{
              "@media (max-width: 480px)": {
                width: "100vw",
                height: "100dvh", // 🔹 cijeli ekran
                objectFit: "contain",
                top: "50%",
                left: "58%",
                transform: "translate(-50%, -50%) scale(2.0)",
                transformOrigin: "center",
              },
            }}
          />

          {/* === SADRŽAJ === */}
          <Box
            position="relative"
            zIndex={3}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
            w="clamp(16rem, 40vw, 24rem)"
            textAlign="center"
            h="80vh"
            ml="-4.5rem"
            sx={{
              "@media (max-width: 480px)": {
                gap: "0.4rem", // 🔹 puno manji razmak između svih elemenata na mobilnoj
                h: "45vh",
                mr: "-5rem", // 🔹 centrirano na mobitelu
              },
            }}
          >
            <Box mt="clamp(-1rem, -3vw, -0.5rem)">
              <Box
                color="#FFF"
                fontWeight="800"
                fontSize="clamp(1.2rem, 2vw, 1.6rem)"
                textShadow="0 0.2rem 0.2rem rgba(0,0,0,0.25)"
                fontFamily="Jost"
              >
                CONGRATULATIONS
              </Box>
              <Box
                bgGradient="linear(90deg, #FFF2D2 0%, #F8D276 100%)"
                bgClip="text"
                color="transparent"
                fontWeight="800"
                fontSize="clamp(1.2rem, 2vw, 1.6rem)"
                lineHeight="1.2"
                fontFamily="Jost"
              >
                YOU WON
              </Box>
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap="0.5rem"
              mt="clamp(-1rem, -2vw, 0rem)"
            >
              <Box
                bgGradient="linear(90deg, #FFF2D2 0%, #F8D276 100%)"
                bgClip="text"
                color="transparent"
                fontFamily="Jost, sans-serif"
                fontWeight="800"
                fontSize="clamp(8rem, 12vw, 13rem)"
                lineHeight="1"
                textAlign="center"
              >
                5
              </Box>

              <Box
                fontWeight="700"
                fontSize="clamp(2rem, 5vw, 4rem)"
                color="white"
                letterSpacing="0.05em"
                lineHeight="1.2"
                textAlign="center"
              >
                FREE SPINS
              </Box>
            </Box>

            {!claimed ? (
              <Box
                as="button"
                display="inline-flex"
                justifyContent="center"
                alignItems="center"
                padding="clamp(0.6rem, 1vw, 1rem) clamp(2rem, 4vw, 3rem)"
                borderRadius="clamp(1rem, 3vw, 2rem)"
                border="2px solid rgba(255, 216, 247, 0.40)"
                background="linear-gradient(180deg, #FFF2D2 0%, #F8D276 100%)"
                color="#1F2763"
                fontFamily="Jost"
                fontWeight="700"
                fontSize="clamp(0.9rem, 1.5vw, 1.25rem)"
                mt="clamp(1rem, 4vw, 3rem)"
                mb="clamp(1rem, 5vw, 3rem)"
                cursor="pointer"
                transition="all 0.25s ease"
                _hover={{
                  transform: "scale(1.05)",
                  boxShadow: "0 0 1rem rgba(255, 216, 247, 0.4)",
                }}
                onClick={() => setClaimed(true)}
              >
                CLAIM PRIZE
              </Box>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap="1.5rem"
                mt="clamp(1rem, 4vw, 3rem)"
                mb="clamp(1rem, 5vw, 3rem)"
              >
                <Box
                  border="2px dashed rgba(255, 242, 210, 0.8)"
                  borderRadius="16px"
                  px="clamp(1.5rem, 8vw, 9rem)"
                  py="clamp(0.75rem, 1.5vw, 1rem)"
                  bg="linear-gradient(180deg, rgba(255, 242, 210, 0.2) 0%, rgba(248, 210, 118, 0.2) 100%)"
                  textAlign="center"
                >
                  <Text
                    bgGradient="linear(180deg, #FFF2D2 0%, #F8D276 100%)"
                    bgClip="text"
                    color="transparent"
                    textShadow="0 0 8px rgba(0, 0, 0, 0.32)"
                    fontFamily="Jost, sans-serif"
                    fontWeight="800"
                    fontSize="clamp(1.4rem, 2.3vw, 2rem)"
                    lineHeight="1.3"
                    letterSpacing="0.02em"
                  >
                    WHALE.IO
                  </Text>
                </Box>

                <Box
                  as="button"
                  onClick={() => {
                    navigator.clipboard.writeText("WHALE.IO").catch(() => {});

                    const toast = document.createElement("div");
                    toast.innerText = "✅ Code copied!";
                    toast.style.position = "fixed";
                    toast.style.bottom = "20px";
                    toast.style.left = "50%";
                    toast.style.transform = "translateX(-50%)";
                    toast.style.background = "rgba(0,0,0,0.8)";
                    toast.style.color = "#fff";
                    toast.style.padding = "10px 20px";
                    toast.style.borderRadius = "20px";
                    toast.style.fontSize = "16px";
                    toast.style.zIndex = "9999";
                    toast.style.opacity = "0";
                    toast.style.transition = "opacity 0.3s ease";
                    document.body.appendChild(toast);
                    setTimeout(() => (toast.style.opacity = "1"), 10);
                    setTimeout(() => {
                      toast.style.opacity = "0";
                      setTimeout(() => toast.remove(), 300);
                    }, 1200);

                    setTimeout(() => {
                      window.location.href = "https://whale.io";
                    }, 1200);
                  }}
                  display="inline-flex"
                  justifyContent="center"
                  alignItems="center"
                  px="clamp(2rem, 4vw, 3rem)"
                  py="clamp(0.8rem, 1.5vw, 1rem)"
                  borderRadius="clamp(1rem, 3vw, 2rem)"
                  bgGradient="linear(180deg, #FFF2D2 0%, #F8D276 100%) !important"
                  color="#553E07 !important"
                  fontFamily="Jost"
                  fontWeight="800"
                  fontSize="clamp(1.3rem, 2.3vw, 1.6rem)"
                  lineHeight="1.3"
                  letterSpacing="0.02em"
                  border="2px solid rgba(255, 255, 255, 0.4)"
                  cursor="pointer"
                  zIndex={10}
                  mixBlendMode="normal"
                  transition="all 0.25s ease"
                  _hover={{
                    transform: "scale(1.05)",
                    boxShadow: "0 0 1rem rgba(248, 210, 118, 0.5)",
                  }}
                >
                  COPY&nbsp;&amp;&nbsp;CLAIM
                </Box>
              </Box>
            )}
          </Box>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Wheel;
