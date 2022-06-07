import React, { useMemo } from "react";
import CustomModal from "components/CustomModal";
import { useWallet } from "use-wallet";
import styled from "styled-components";

declare const window: any;

interface ConfirmTransactionModalProps {
  isOpen: boolean;
  message?: string;
}

const ConfirmTransactionModal: React.FC<ConfirmTransactionModalProps> = ({ isOpen, message }) => {
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

  const ContentMemo = useMemo(() => {
    return (
      <>
        {WalletLogo}
        <StyledText>{message}</StyledText>
      </>
    );
  }, [message, WalletLogo]);

  return <CustomModal isOpen={isOpen} content={ContentMemo} />;
};

const StyledText = styled.div`
  font-size: 24px;
  text-align: center;
`;

export default React.memo(ConfirmTransactionModal);
