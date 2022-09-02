import React from "react";
import { Box, Modal } from "@mui/material";
import styled from "styled-components";

interface CustomModalProps {
  isOpen?: boolean;
  content: React.ReactNode;
}

const ConfirmTransactionModal: React.FC<CustomModalProps> = ({ isOpen, content }) => {
  return (
    <Modal open={isOpen === undefined || isOpen === false ? false : true}>
      <StyledBox flexDirection="column" padding={4}>
        {content}
      </StyledBox>
    </Modal>
  );
};

const StyledBox = styled(Box)`
  background: radial-gradient(circle at center top, rgb(32, 36, 45), rgb(20, 23, 31));
  border: 0px;
  border-radius: 24px;
  box-shadow: rgb(10, 12, 15) -8px 8px 16px 0px;
  display: flex;
  flex-direction: column;
  -webkit-box-pack: end;
  justify-content: flex-end;
  max-height: calc(100vh - 72px);
  max-width: 600px;
  position: relative;
  width: 100%;
  margin: 100px auto;
`;

export default React.memo(ConfirmTransactionModal);
