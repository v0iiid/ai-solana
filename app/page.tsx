'use client';

import { ReactNode, useState } from 'react';
import Navbar from './components/Navbar';
import { Metaplex, } from "@metaplex-foundation/js";
import { Circle, Send } from 'lucide-react';
import axios from 'axios';
import { motion } from "framer-motion"
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
const connection = new Connection('https://api.testnet.solana.com', 'confirmed');
const metaplex = Metaplex.make(connection);
const exampleCommands = [
  "Send 0.1 SOL To address",
  "Show My Balance",
  "airdop 1 SOL",
  "show transaction history"
];

type Message = { role: string; text: string };
export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const { publicKey } = useWallet();
  const wallet = useWallet()
  const [view, setView] = useState<'landing' | 'chat'>('landing')
  const [messages, setMessages] = useState<Message[]>([])

  const [isLoading, setIsLoading] = useState(false)
  async function fetchNFTCount(publicKey: PublicKey): Promise<number> {
    // Fetch NFTs owned by the wallet address
    const nfts = await metaplex.nfts().findAllByOwner({ owner: publicKey });
    return nfts.length;
  }
  const hanldeSubmit = async () => {
    setIsLoading(true)
    setView('chat')
    setMessages((prev) => [...prev, { role: 'user', text: prompt }])
    setPrompt('')
    const response = await axios.post("/api/prompt", {
      prompt: prompt
    })
    setIsLoading(false)
    const data = response.data.message
    const cleaned = data.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
      const command = parsed.command
      const message = parsed.message
      const amount = parsed.amount
      setMessages((prev) => [...prev, { role: 'system', text: message }])
      if (!publicKey) {
        setMessages((prev) => [
          ...prev,
          { role: 'system', text: '❌ Wallet not connected. Please connect your wallet.' }
        ]);
        return;
      }
      else if (command === 'get_balance') {
        try {

          const lamports = await connection.getBalance(publicKey);
          const sol = lamports / 1e9;
          setMessages((prev) => [
            ...prev,
            { role: 'system', text: `💰 Your balance is ${sol.toFixed(4)} SOL.` }
          ]);
        } catch (error) {
          console.error('Balance fetch failed:', error);
          setMessages((prev) => [
            ...prev,
            { role: 'system', text: '❌ Failed to fetch balance.' }
          ]);
        }
      }
      else if (command === 'airdrop') {
        try {
          if (!publicKey) {
            setMessages((prev) => [
              ...prev,
              { role: 'system', text: '❌ Wallet not connected. Please connect your wallet.' }
            ]);
            return;
          }

          // Request airdrop of 1 SOL
          const signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL * amount);
          await connection.confirmTransaction(signature, 'confirmed');

          setMessages((prev) => [
            ...prev,
            { role: 'system', text: '✅ Airdrop successful! You received 1 SOL.' }
          ]);
        } catch (error) {
          console.error('Airdrop failed:', error);
          setMessages((prev) => [
            ...prev,
            { role: 'system', text: '❌ Airdrop failed. Try again later.' }
          ]);
        }
      }
      else if (command === 'get_nfts') {
        try {
          if (!publicKey) {
            setMessages((prev) => [
              ...prev,
              { role: 'system', text: '❌ Wallet not connected. Please connect your wallet.' }
            ]);
            return;
          }

          // Replace this with your actual NFT fetching logic
          const nftCount = await fetchNFTCount(publicKey);

          setMessages((prev) => [
            ...prev,
            { role: 'system', text: `🎨 You own ${nftCount.toLocaleString()} NFT${nftCount !== 1 ? 's' : ''}.` }
          ]);
        } catch (error) {
          console.error('NFT fetch failed:', error);
          setMessages((prev) => [
            ...prev,
            { role: 'system', text: '❌ Failed to fetch NFTs.' }
          ]);
        }
      }
      else if (command === 'get_transactions') {
        try {
          if (!publicKey) {
            setMessages((prev) => [
              ...prev,
              { role: 'system', text: '❌ Wallet not connected. Please connect your wallet.' }
            ]);
            return;
          }

          // Fetch last 10 confirmed signatures for the public key
          const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });

          if (signatures.length === 0) {
            setMessages((prev) => [
              ...prev,
              { role: 'system', text: 'ℹ️ No recent transactions found.' }
            ]);
            return;
          }

          // Format a message listing recent transaction signatures with dates
          const formattedTxs = signatures.map(sig => {
            const date = sig.blockTime ? new Date(sig.blockTime * 1000).toLocaleString() : 'Unknown date';
            return `• ${sig.signature.slice(0, 8)}... on ${date}`;
          }).join('\n');

          setMessages((prev) => [
            ...prev,
            { role: 'system', text: `📜 Last ${signatures.length} transactions:\n${formattedTxs}` }
          ]);
        } catch (error) {
          console.error('Transaction fetch failed:', error);
          setMessages((prev) => [
            ...prev,
            { role: 'system', text: '❌ Failed to fetch transactions.' }
          ]);
        }
      }
      else if (command === 'send_sol') {
        const { amount, to } = parsed;

        if (!amount || !to) {
          setMessages((prev) => [
            ...prev,
            { role: 'system', text: '⚠️ Please provide both amount and recipient address.' },
          ]);
          return;
        }

        if (!wallet || !wallet.signTransaction) {
          setMessages((prev) => [
            ...prev,
            { role: 'system', text: '❌ Wallet not connected or does not support signing transactions.' },
          ]);
          return;
        }

        try {
          setMessages((prev) => [
            ...prev,
            { role: 'system', text: `🔄 Sending ${amount} SOL to ${to} on Testnet...` },
          ]);

          const toPublicKey = new PublicKey(to);
          const lamports = Math.round(amount * 1e9);

          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: toPublicKey,
              lamports,
            })
          );

          transaction.feePayer = publicKey;
          const { blockhash } = await connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;

          const signedTransaction = await wallet.signTransaction(transaction);
          const signature = await connection.sendRawTransaction(signedTransaction.serialize());

          await connection.confirmTransaction(signature);

          setMessages((prev) => [
            ...prev,
            { role: 'system', text: `✅ Sent ${amount} SOL to ${to} on Testnet. Tx Signature: ${signature}` },
          ]);
        } catch (error) {
          console.error('Send SOL failed:', error);
          setMessages((prev) => [
            ...prev,
            { role: 'system', text: `❌ Failed to send SOL: ${error}` },
          ]);
        }
      }
    }
    catch (err) {
      console.error('Failed to parse JSON:', err);
    }
  }

  return (
    <Background>
      <div className="h-screen  flex flex-col text-[#ffffffe9] ">
        <Navbar />
        {/* Chat area */}
        {view == 'chat' && (
          <div className='w-2xl mx-auto pb-20'>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-full   ${msg.role === 'user' ? 'justify-end mt-4 mb-6' : 'mt-1'}`}>
                <div className={`rounded-2xl flex  ${msg.role === 'user' ? 'bg-zinc-700  py-3 px-4' : 'bg-transparent text-white/90 px-4'}`}>
                  <p>{msg.text}</p>
                  {/* {(isLoading && msg.role == 'system') && (
                  <div className="flex mt-4 text-white/60 italic animate-pulse">
                    <p>Typing...</p>
                  </div>
                )} */}
                </div>
              </div>
            ))}

          </div>
        )}
        {view === 'landing' && (
          <div className='mt-40 text-left flex justify-center flex-col items-center'>
            <h1 style={{ wordSpacing: '0.1em', letterSpacing: '0.06em' }} className='text-4xl font-[600]'>Chat With Solana Blockchain</h1>
            <p className='text-sm pt-2 text-[#ffffff82]'>A tool that help you perform task and talk to blockchain using message.</p>
          </div>
        )}
        {/* Input area */}
        <motion.div
          className='  w-full  flex mt-8  flex-col items-center'>
          {/* {view === 'landing' && (
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <img
                src="/a.svg"
                className="w-full h-full object-cover"
                alt="background"
              />
            </div>
          )} */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed bottom-4 w-full flex flex-col items-center z-50"
          >
            <div
              className="
      p-1 flex gap-3
      shadow-[0_10px_30px_rgba(0,0,0,0.6)]
      border border-zinc-600
      justify-center items-center
      bg-[#202225] rounded-full
      w-[90%] max-w-lg
      ring-1 ring-white/10
      backdrop-blur-sm
    "
            >
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask something like 'Send 1 SOL to ...'"
                className="flex-1 px-6 py-4 rounded-xl text-white text-sm placeholder-zinc-400 focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                onClick={hanldeSubmit}
                className="bg-gradient-to-r from-green-300 to-green-800 hover:from-green-400 hover:border-green-400 border-green-100 px-2 py-2 mr-[6px] rounded-full text-white cursor-pointer"
              >
                {isLoading ? <Circle className="text-white/70" /> : <Send className="text-white/70" />}
              </button>
            </div>
          </motion.div>
          {
            view === 'landing' && (
              <div className='flex items-center justify-center mt-4 gap-3 flex-wrap max-w-md mx-auto '>
                {exampleCommands.map((command, index) => {
                  return (
                    <div key={index}>
                      <Item text={command} onClick={() => setPrompt(command)} />
                    </div>
                  )
                })}
              </div>
            )
          }
        </motion.div>
      </div>
    </Background>
  );
}


function Item({ text, onClick }: { text: string, onClick: (text: string) => void }) {
  return (
    <div
      onClick={() => onClick(text)}
      className='text-xs text-center cursor-pointer  bg-green-800/30 text-green-500 w-fit rounded-full px-2 py-1 border-green-400 border-1 items-center flex justify-center'
    >{text}</div>
  )
}

function Background({ children }: { children: ReactNode }) {
  return (<div className="relative min-h-screen overflow-hidden">
    <div className='w-[1512px] h-[990px] top-0 absolute bg-[rgba(15, 15, 15, 0.1)]  backdrop-blur-[90px] z-0 ' />
        <div className='w-[2000px] h-[443px] top-[100]  overflow-hidden absolute -z-10 blur-[10px] bg-[#0F0F0F] ' />
    <div className='w-[1801px] overflow-hidden h-[296px] blur-[80px] -z-20 absolute top-0 bg-[conic-gradient(from_190deg_at_40%_80%,#0019FF_0%,#00FF26_51.44%,#0019FF_100%)]' />

    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.12] mix-blend-overlay pointer-events-none" />
    <div className="relative z-10">
      {children}
    </div>
  </div>)
}