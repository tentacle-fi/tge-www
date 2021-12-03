import React, { useMemo } from "react";
import { Modal, ModalContent, ModalProps, Spacer } from "react-neu";
import styled from "styled-components";
import { useWallet } from "use-wallet";

import metamaskLogo from "assets/metamask-fox.svg";
import sparrowLogo from "assets/sparrow.png";

declare const window: any;

interface CustomModalProps extends ModalProps {
  message?: string;
}

const ConfirmTransactionModal: React.FC<CustomModalProps> = ({ isOpen, message }) => {
  const { connector } = useWallet();

  if (message === undefined || message === "") {
    message = "Confirm transaction in wallet.";
  }

  let injectedLogo = metamaskLogo;

  if (window.ethereum) {
    if (window.ethereum.isSparrow) {
      injectedLogo = sparrowLogo;
    }
  }

  const WalletLogo = useMemo(() => {
    if (connector === "injected") {
      return <img src={injectedLogo} alt="Wallet Logo" style={{ height: 96, width: 96, alignSelf: "center" }} />;
    }
  }, [connector, injectedLogo]);

  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        {WalletLogo}
        <Spacer />
        <StyledText>{message}</StyledText>
      </ModalContent>
    </Modal>
  );
};

const StyledText = styled.div`
  font-size: 24px;
  text-align: center;
`;

export default ConfirmTransactionModal;
