import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  useDisclosure,
  Box,
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

/* ==== NOVI NAZIVI KEYFRAMESA ==== */
const raysSpinCCW = keyframes`
  from { transform: rotate(0deg)    scale(1.06); }
  to   { transform: rotate(-360deg) scale(1.06); }
`;
const raysSpinCW = keyframes`
  from { transform: rotate(0deg)    scale(1.06); }
  to   { transform: rotate(360deg)  scale(1.06); }
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
    const savedClaimed = localStorage.getItem("claimedPrize");
    const savedSpins = localStorage.getItem("remainingSpins");

    if (savedClaimed === "true") {
      setClaimed(true);
      onOpen(); // otvori modal odmah
    }

    if (savedSpins !== null) {
      setSpinsLeft(parseInt(savedSpins, 10));
    }
  }, []);

  /* === Čuvaj stanje kad se promijeni === */
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

      // Pozadina sektora
      // Pozadina sektora
      if (sector.label === "FREE SPINS") {
        // Novi gradient (žuto - svjetlo žuto)
        const gradient = ctx.createLinearGradient(
          centerX,
          centerY - radius,
          centerX,
          centerY + radius
        );
        gradient.addColorStop(0, "#FFE4A3"); // gornja boja
        gradient.addColorStop(1, "#FEEFCB");

        ctx.fillStyle = gradient;
      } else {
        // Gradient za TRY AGAIN (ostaje isti)
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

      // ======= TEKST =======
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
        ctx.fillStyle = "#FFF"; // bijeli tekst
        ctx.fillText("TRY", x, y - fontSize / 2);
        ctx.fillText("AGAIN", x, y + fontSize / 1.2);
      } else {
        // Gradient tekst za FREE SPINS
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
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "r") {
        // CTRL + R kao shortcut
        localStorage.removeItem("claimedPrize");
        window.location.reload(); // refresha da krene od nule
        console.log("🔄 Resetovan claimedPrize");
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const spin = () => {
    if (spinsLeft <= 0 || isSpinning || claimed) return; // spriječi ponovno

    setIsSpinning(true);
    const next = spinCount + 1;
    setSpinCount(next);

    let rotation = angle;
    let frames = 0;

    const targetIndex = next === 1 ? 1 : 0;
    let targetAngle = targetIndex * sliceAngle;
    if (next === 1) targetAngle += sliceAngle / 6;

    const pointerOffset = -Math.PI / 2;
    const extraSpins = 5 * 2 * Math.PI;
    const finalAngle = extraSpins + pointerOffset - targetAngle;

    const interval = setInterval(() => {
      frames++;
      const progress = frames / 100;
      rotation = angle + finalAngle * Math.sin((progress * Math.PI) / 2);
      setAngle(rotation);

      if (frames >= 100) {
        clearInterval(interval);
        setIsSpinning(false);
        setSpinsLeft((p) => p - 1);
        if (next === 2) {
          setTimeout(() => {
            onOpen(); // samo otvori modal
            // ⚠️ maknuto setClaimed(true)
          }, 750);
        }
      }
    }, 20);
  };
  useEffect(() => {
    const savedClaimed = localStorage.getItem("claimedPrize");
    if (savedClaimed === "true") {
      setClaimed(true);
    }
  }, []);
  const alwaysOpen = claimed;
  return (
    <Box
      position="relative"
      w="100%"
      maxW={["400px", "600px", "900px"]}
      aspectRatio="1/1"
      mx="auto"
      mb={["20px", "40px", "60px"]}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{ width: "100%", height: "100%", borderRadius: "50%" }}
      />

      {/* Ring overlay */}
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

      {/* Spin Button */}
      <Box
        onClick={spin}
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        cursor="pointer"
      >
        <SpinButton />
      </Box>

      {/* Pointer */}
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
      <Modal
        isOpen={alwaysOpen || isOpen} // ako je claimed => uvijek true
        onClose={() => {
          if (!claimed) {
            setClaimed(false);
            onClose();
          }
        }}
        isCentered
        closeOnOverlayClick={false} // ne može zatvoriti klikom na pozadinu
        closeOnEsc={false} // ne može zatvoriti ESC-om
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
        >
          {/* === BACKGROUND SLOJEVI === */}
          <Box
            position="absolute"
            inset={0}
            zIndex={0}
            pointerEvents="none"
            sx={{
              backgroundImage: "url(/sun-rayBG.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.06,
            }}
          />

          <Box
            position="absolute"
            inset={0}
            zIndex={0}
            pointerEvents="none"
            sx={{
              backgroundImage: "url(/sun-ray-bg.png)",
              backgroundSize: "110% 110%",
              backgroundPosition: "center",
              mixBlendMode: "screen",
              transformOrigin: "50% 50%",
              willChange: "transform, filter, opacity",
              filter: "blur(1px) contrast(1.2) saturate(1.1)",
              opacity: 0.5,
            }}
            animation={`${raysSpinCCW} 36s linear infinite`}
          />

          <Box
            position="absolute"
            inset={0}
            zIndex={0}
            pointerEvents="none"
            sx={{
              backgroundImage: "url(/sun-ray-bg.png)",
              backgroundSize: "110% 110%",
              backgroundPosition: "center",
              mixBlendMode: "screen",
              transformOrigin: "50% 50%",
              willChange: "transform, filter, opacity",
              filter: "blur(1px) contrast(1.2) saturate(1.1)",
              opacity: 0.5,
            }}
            animation={`${raysSpinCW} 36s linear infinite`}
          />

          {/* Dimmer i glow */}
          <Box
            position="absolute"
            inset={0}
            zIndex={1}
            pointerEvents="none"
            sx={{
              background:
                "radial-gradient(circle at 50% 40%, rgba(0,0,0,.18) 0%, rgba(0,0,0,.28) 55%, rgba(0,0,0,.36) 100%)",
            }}
          />

          <Box
            position="absolute"
            inset={0}
            zIndex={1}
            pointerEvents="none"
            sx={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,235,180,0.35) 0%, rgba(255,214,120,0.22) 40%, rgba(255,190,90,0.10) 65%, rgba(255,190,90,0) 78%)",
              mixBlendMode: "screen",
              transformOrigin: "50% 50%",
            }}
            animation={`${coreGlowPulse} 2.8s ease-in-out infinite`}
          />

          <Box
            position="absolute"
            inset={0}
            zIndex={1}
            pointerEvents="none"
            sx={{
              backgroundImage: `
  radial-gradient(circle, rgba(255,255,255,0.9) 0 2px, rgba(255,255,255,0) 3px),
  radial-gradient(circle, rgba(255,200,255,0.8) 0 2px, rgba(255,255,255,0) 3px)
`,
              backgroundSize: [
                "260px 260px, 200px 200px",
                "200px 200px, 160px 160px",
              ], // veće tačke na mobu
              backgroundPosition: "22% 32%, 68% 46%",
              mixBlendMode: "screen",
              opacity: 1.2,
            }}
            animation={`${sparklesBlink} 3s ease-in-out infinite`}
          />

          {/* Tamni overlay */}
          <Box
            position="absolute"
            inset={0}
            bg="#51003A99"
            zIndex={1}
            pointerEvents="none"
            backdropFilter="blur(2px)"
          />

          {/* Frame PNG */}
          <Box
            as="img"
            src="/blueWinningModal.png"
            alt="Winning Frame"
            position="absolute"
            top="0"
            left="0"
            w="100%"
            h="100%"
            objectFit="contain"
            pointerEvents="none"
            zIndex={2}
          />

          {/* === SADRŽAJ === */}
          <Box
            position="relative"
            zIndex={3}
            w="100%"
            h="100%"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            color="white"
            px={[4, 6]}
          >
            {claimed && (
              <Box
                w="full"
                maxW="clamp(240px, 70%, 450px)"
                mx="auto"
                mt={[4, 5, 6]}
                border="2px dashed #FF5EDF"
                borderRadius="16px"
                bgGradient="linear(249deg, rgba(255, 94, 223, 0.20) 14.07%, rgba(224, 0, 180, 0.20) 85.93%)"
                py={[3, 4]}
                px={[4, 6]}
                textAlign="center"
                fontWeight="bold"
                fontSize={["16px", "18px", "20px"]}
                color="white"
              >
                WHALE.IO
              </Box>
            )}

            {/* Dugme fiksirano dole */}
            <Box
              position="absolute"
              bottom={["30%", "25%", "13%"]}
              left="50%"
              transform="translateX(-50%)"
              zIndex={4}
            ></Box>
          </Box>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Wheel;
