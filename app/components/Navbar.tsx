'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AirVentIcon } from 'lucide-react';
import "./wallet-modal.css"


export default function Navbar() {

  return (
    <nav className="relative flex justify-between items-center p-4 px-20 mb-10 rounded-b-2xl">

      {/* Decorative blurred background glow */}

      {/* Logo / App Name */}
      <div className="text-xl font-semibold text-white flex gap-2 items-center">
        <AirVentIcon className='text-green-200' />
        <p>AskSOL</p>
      </div>

      {/* Custom styled WalletMultiButton */}
      <WalletMultiButton
        className="
          flex items-center justify-center
          bg-gradient-to-r from-green-500 to-green-800
          hover:from-green-600 hover:to-green-900
          text-white font-semibold text-sm
          py-2 px-6 rounded-xl
          shadow-lg shadow-green-700/50
          backdrop-blur-md
          transition-all hover:scale-105
        "
      />
    </nav>
  );
}