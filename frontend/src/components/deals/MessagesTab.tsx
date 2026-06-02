'use client';
import { useState, useEffect, useRef } from 'react';

interface Party {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

interface Message {
  id: string;
  sender: string;
  senderRole: string;
  text: string;
  time: string;
}

interface Props {
  dealId: string;
  parties: Party[];
  currentUserName: string;
  currentUserRole: string;
}

const STORAGE_KEY = (dealId: string) => `deal_messages_${dealId}`;

const SEED: Record<string, Record<string, Message[]>> = {
  d1: {
    'd1_David Walsh': [
      { id:'m1', sender:'Jane Cooper',  senderRole:'BUYER_CONVEYANCER',  text:"Hi David, can you confirm when the title search will be ready? We're targeting settlement in two weeks.", time:'Yesterday 2:14 PM' },
      { id:'m2', sender:'David Walsh',  senderRole:'SELLER_CONVEYANCER', text:'Hi Jane, should have it back by Thursday. Nothing flagged in the preliminary checks.',                       time:'Yesterday 3:02 PM' },
      { id:'m3', sender:'Jane Cooper',  senderRole:'BUYER_CONVEYANCER',  text:"Perfect, thanks David. Let me know if anything comes up.",                                                     time:'Yesterday 3:08 PM' },
    ],
    'd1_Michael Torres': [
      { id:'m4', sender:'Jane Cooper',    senderRole:'BUYER_CONVEYANCER', text:'Michael, just confirming your building and pest reports have been received and reviewed. All looking good from our end.', time:'2 days ago' },
      { id:'m5', sender:'Michael Torres', senderRole:'BUYER',             text:'Great news! Thanks Jane. Do I need to do anything else before settlement?',                                              time:'2 days ago' },
      { id:'m6', sender:'Jane Cooper',    senderRole:'BUYER_CONVEYANCER', text:"Just the title check to come back clear — David is on it. I'll keep you posted.",                                       time:'2 days ago' },
    ],
    'd1_Emma Wilson': [
      { id:'m7', sender:'Emma Wilson', senderRole:'AGENT',              text:'Hi Jane, just checking in — is everything on track for the 15 May settlement?',                           time:'1 day ago' },
      { id:'m8', sender:'Jane Cooper', senderRole:'BUYER_CONVEYANCER',  text:'Hi Emma, yes — conditions are largely met, just waiting on the title search. Should be clear by end of week.', time:'1 day ago' },
    ],
    'd1_Sarah Chen': [
      { id:'m9',  sender:'Jane Cooper', senderRole:'BUYER_CONVEYANCER', text:"Sarah, just a quick update — we're on track for the 15 May settlement date. No issues on our end.", time:'3 days ago' },
      { id:'m10', sender:'Sarah Chen',  senderRole:'SELLER',            text:'Thanks Jane, that is reassuring. Happy to proceed as planned.',                                     time:'3 days ago' },
    ],
  },
  d2: {
    'd2_Tom Nguyen': [
      { id:'m11', sender:'Lisa Park',  senderRole:'BUYER_CONVEYANCER', text:"Tom, all conditions are met and we're ready to proceed to settlement. Please confirm your availability.", time:'Today 9:15 AM' },
      { id:'m12', sender:'Tom Nguyen', senderRole:'BUYER',             text:'Confirmed. I am available all day Friday.',                                                                time:'Today 9:32 AM' },
    ],
    'd2_Ray Santos': [
      { id:'m13', sender:'Lisa Park',  senderRole:'BUYER_CONVEYANCER', text:'Ray, the title came back clear. We will book settlement for Friday if that suits you.', time:'Today 10:00 AM' },
      { id:'m14', sender:'Ray Santos', senderRole:'SELLER',            text:'Friday works for me. Looking forward to completing.',                                    time:'Today 10:18 AM' },
    ],
  },
};

function loadMessages(dealId: string): Record<string, Message[]> {
  if (typeof window === 'undefined') return SEED[dealId] ?? {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY(dealId));
    if (stored) return JSON.parse(stored);
    // First load — seed and persist
    const seed = SEED[dealId] ?? {};
    if (Object.keys(seed).length > 0) {
      localStorage.setItem(STORAGE_KEY(dealId), JSON.stringify(seed));
    }
    return seed;
  } catch {
    return SEED[dealId] ?? {};
  }
}

function saveMessages(dealId: string, data: Record<string, Message[]>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY(dealId), JSON.stringify(data));
}

export default function MessagesTab({ dealId, parties, currentUserName, currentUserRole }: Props) {
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadMessages(dealId));
  }, [dealId]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [selectedParty, messages]);

  const otherParties = parties.filter((p) => p.name !== currentUserName);

  function threadKey(partyName: string) {
    return `${dealId}_${partyName}`;
  }

  function send() {
    if (!input.trim() || !selectedParty) return;
    const key = threadKey(selectedParty.name);
    const now = new Date();
    const time = `Today ${now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}`;
    const msg: Message = {
      id: `msg_${Date.now()}`,
      sender: currentUserName,
      senderRole: currentUserRole,
      text: input.trim(),
      time,
    };
    const updated = { ...messages, [key]: [...(messages[key] || []), msg] };
    setMessages(updated);
    saveMessages(dealId, updated);
    setInput('');
  }

  const thread = selectedParty ? (messages[threadKey(selectedParty.name)] || []) : [];

  return (
    <div className="flex gap-0 min-h-[400px]">
      {/* Party list */}
      <div className="w-52 border-r border-gray-100 pr-4 flex-shrink-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Parties</p>
        {otherParties.length === 0 ? (
          <p className="text-xs text-gray-400">No other parties on this deal.</p>
        ) : (
          otherParties.map((party) => {
            const key = threadKey(party.name);
            const thread = messages[key] || [];
            const last = thread[thread.length - 1];
            const isActive = selectedParty?.name === party.name;
            return (
              <button
                key={party.id}
                onClick={() => setSelectedParty(party)}
                className={`w-full text-left px-2 py-2.5 rounded-lg mb-0.5 transition-colors ${
                  isActive ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 ${party.color} flex items-center justify-center`}>
                    <span className="text-[9px] font-bold">{party.initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{party.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{party.role}</p>
                  </div>
                </div>
                {last ? (
                  <p className="text-[10px] text-gray-400 mt-1 truncate pl-9">{last.text}</p>
                ) : (
                  <p className="text-[10px] text-gray-400 mt-1 pl-9 italic">No messages yet</p>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col pl-5">
        {!selectedParty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600">Select a party to message</p>
            <p className="text-xs text-gray-400 mt-1">Messages are internal to this deal</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-gray-100">
              <div className={`w-8 h-8 rounded-full flex-shrink-0 ${selectedParty.color} flex items-center justify-center`}>
                <span className="text-xs font-bold">{selectedParty.initials}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedParty.name}</p>
                <p className="text-xs text-gray-400">{selectedParty.role} · Internal deal message</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={feedRef} className="flex-1 overflow-y-auto space-y-3 mb-3" style={{ maxHeight: 260, minHeight: 160 }}>
              {thread.length === 0 ? (
                <div className="flex items-center justify-center h-full py-8">
                  <p className="text-xs text-gray-400 italic">No messages yet — start the conversation below.</p>
                </div>
              ) : (
                thread.map((msg) => {
                  const isMe = msg.sender === currentUserName;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[78%]">
                        {!isMe && <p className="text-[10px] text-gray-400 mb-1 ml-1">{msg.sender}</p>}
                        <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                          isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>
                        <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>{msg.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={`Message ${selectedParty.name.split(' ')[0]}…`}
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={send}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
