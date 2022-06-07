import React, { useMemo } from "react";
import { Modal, ModalContent, ModalProps } from "react-neu";
import styled from "styled-components";
import { useWallet } from "use-wallet";

declare const window: any;

interface CustomModalProps extends ModalProps {
  message?: string;
}

const ConfirmTransactionModal: React.FC<CustomModalProps> = ({ isOpen, message }) => {
  const { connector } = useWallet();

  if (message === undefined || message === "") {
    message = "Confirm transaction in wallet.";
  }

  let injectedLogo = "metamask-fox.svg";

  if (window.ethereum) {
    if (window.ethereum.isSparrow) {
      injectedLogo = "sparrow.png";
    }
  }

  const WalletLogo = useMemo(() => {
    if (connector === "injected") {
      return <img src={`/wallets/${injectedLogo}`} alt="Wallet Logo" style={{ height: 110, margin: 20, alignSelf: "center" }} />;
    }
  }, [connector, injectedLogo]);

  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        {WalletLogo}
        <StyledText>{message}</StyledText>
      </ModalContent>
    </Modal>
  );
};

const StyledText = styled.div`
  font-size: 24px;
  text-align: center;
`;

export default React.memo(ConfirmTransactionModal);
