import { createContext, useContext, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

interface Web3ContextType {
  address?: string;
  isConnected: boolean;
  isConnecting: boolean;
  openConnectModal?: () => void;
  disconnect: () => void;
  chainId?: number;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected, chainId } = useAccount();
  const { isLoading: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  return (
    <Web3Context.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        openConnectModal,
        disconnect,
        chainId,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
