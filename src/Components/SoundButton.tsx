import { Box, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import React from "react";

const SoundButton = () => {
  const [muted, setMuted] = useState(false);

  return (
    <IconButton
      aria-label="Toggle sound"
      onClick={() => setMuted(!muted)}
      icon={
        muted ? (
          // MUTE ICON
          <Box
            as="svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="white"
            w="60%" // ikonica unutar kruga
            h="60%"
          >
            <path d="M10 3L6 7H3v6h3l4 4V3zM14.121 5.879l-1.414 1.414L15.414 10l-2.707 2.707 1.414 1.414L17.243 10l-3.122-4.121z" />
          </Box>
        ) : (
          // SOUND ICON
          <Box
            as="svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="white"
            w="60%"
            h="60%"
          >
            <path d="M10.9629 2.84592C11.3434 3.01798 11.5882 3.39518 11.5882 3.8121V16.518C11.5882 16.9349 11.3434 17.3121 10.9629 17.4842C10.5824 17.6562 10.1357 17.5867 9.82463 17.3088L5.36103 13.3415H3.11765C1.94963 13.3415 1 12.3919 1 11.2239V9.10621C1 7.9382 1.94963 6.98857 3.11765 6.98857H5.36103L9.82463 3.02129C10.1357 2.74335 10.5824 2.67717 10.9629 2.84592Z" />
            <path d="M16.654 5.23489C18.0835 6.3996 19 8.17643 19 10.165C19 12.1536 18.0835 13.9305 16.654 15.0952C16.3132 15.3731 15.8136 15.3202 15.5357 14.9794C15.2577 14.6386 15.3107 14.1389 15.6515 13.861C16.7268 12.9875 17.4118 11.6573 17.4118 10.165C17.4118 8.67276 16.7268 7.34261 15.6515 6.46577C15.3107 6.18783 15.261 5.6882 15.5357 5.34739C15.8103 5.00658 16.3136 4.95695 16.654 5.23158V5.23489Z" />
          </Box>
        )
      }
      position="absolute"
      top={["2%", "1.5%", "12px"]}
      right={["2%", "1.5%", "12px"]}
      borderRadius="full"
      bg="rgba(255,255,255,0.1)"
      _hover={{ bg: "rgba(255,255,255,0.2)" }}
      size="sm" // krug mali
      boxSize={["28px", "32px", "36px"]} // responsive veličina dugmeta
    />
  );
};

export default SoundButton;
