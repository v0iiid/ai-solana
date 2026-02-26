'use client';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AirVentIcon, } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 px-20 mb-10">
        <div className='w-20 h-10 top-0 rounded-full left-24 blur-3xl  -z-10 absolute '></div>
 <div className="text-xl font-semibold text-[#ffffffe9] flex gap-1"><AirVentIcon className='text-green-400 pt-1'  /><p className=''>AskSOL</p></div>

        <WalletMultiButton className="text-blue-400" />
    </nav>
  );
}