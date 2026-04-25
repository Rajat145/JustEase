import React, { useState, useRef, useEffect } from 'react';

const QUICK_QUESTIONS = [
  'How do I file an FIR?',
  'Affidavit attestation process',
  'Consumer rights under CPA 2019',
  'How to file an RTI application?',
  'What is Section 138 NI Act?',
  'Legal notice format',
  'How to contest a cheque bounce case?',
  'Rights during police arrest',
];

const KNOWLEDGE_BASE = {
  fir: `To file an FIR (First Information Report) in India:

1. Visit the nearest police station and speak to the Station House Officer (SHO).
2. Narrate the incident clearly — date, time, place, and persons involved.
3. The police are obligated to register your FIR. Refusal is an offence under Section 154 CrPC.
4. You are entitled to a free copy of the FIR.
5. If refused, you can approach the Superintendent of Police or file an online complaint at your state police portal.
6. For cognizable offences (murder, theft, robbery etc.), police must register an FIR without any investigation.

⚠️ Always keep a copy of your FIR for future reference.`,

  affidavit: `Affidavit Attestation Process:

1. Draft your affidavit on non-judicial stamp paper of appropriate value (as per state rules).
2. Fill in your personal details, purpose, and declaration.
3. Visit a Notary Public or First Class Magistrate/Oath Commissioner.
4. You must appear in person — the official will verify your identity.
5. Sign in front of the attesting authority.
6. The officer will affix their seal and signature.
7. Fees: Typically ₹10–₹100 depending on the state.

Common uses: Name change, address proof, income declaration, relationship proof.`,

  consumer: `Consumer Rights Under Consumer Protection Act 2019:

Key Rights:
• Right to Safety — protection against hazardous goods/services
• Right to Information — accurate details about products
• Right to Choose — access to competitive products
• Right to Redressal — seek compensation for defective goods/deficient services
• Right to Consumer Education

Where to File a Complaint:
• District Consumer Commission: Claims up to ₹1 crore (filing fee waived below ₹5 lakh)
• State Consumer Commission: ₹1 crore to ₹10 crore
• National Consumer Commission: Above ₹10 crore

Online Filing: consumerhelpline.gov.in or e-daakhil.nic.in
Time Limit: 2 years from the date of cause of action.`,

  rti: `How to File an RTI Application:

1. Identify the Public Information Officer (PIO) of the department/ministry.
2. Write a plain-language application — no specific format required.
3. State: "I seek information under Right to Information Act, 2005."
4. Attach ₹10 application fee (by IPO/DD/online for central govt).
5. Submit online at rtionline.gov.in (Central Govt) or your State RTI portal.
6. First appeal within 30 days if no reply in 30 days.
7. Second appeal to Central/State Information Commission.

Exemptions: National security, cabinet papers, personal privacy, trade secrets.`,

  '138': `Section 138 — Negotiable Instruments Act (Cheque Bounce):

Offence: Issuing a cheque knowing insufficient funds.

Steps to File:
1. Send a legal notice (Demand Notice) within 30 days of bank memo.
2. If no payment within 15 days of notice, file complaint within 30 days.
3. File before the Magistrate having jurisdiction.
4. Punishment: Up to 2 years imprisonment OR double the cheque amount OR both.

Key Documents Needed:
• Original dishonoured cheque
• Bank's memo/return slip
• Copy of demand notice with postal proof
• Proof of non-payment after notice`,

  arrest: `Rights During Police Arrest in India:

Constitutional & Legal Rights:
• Right to know the grounds of arrest (Article 22)
• Right to consult a lawyer of your choice
• Right to be produced before a Magistrate within 24 hours
• Right to inform a family member or friend
• Right to remain silent (no compulsion to self-incriminate — Article 20)
• Right to medical examination (Section 54 CrPC)
• Right to bail in bailable offences

For Women:
• Can only be arrested by a female police officer
• Cannot be arrested after sunset and before sunrise (except in exceptional circumstances with Magistrate's permission)

If rights are violated, file a writ petition (Habeas Corpus) in the High Court.`,

  default: `Thank you for your question. Here's what I can help with:

📋 **Document Assistance** — affidavits, legal notices, RTI applications
⚖️ **Case Guidance** — filing procedures, what to expect at hearings
📖 **Legal Information** — consumer rights, property law, labour law basics
🔍 **Process Navigation** — step-by-step procedures for common legal actions

For personalized legal advice specific to your situation, I strongly recommend consulting a registered advocate.

Is there a specific area of law you'd like to know more about?`,
};

function getResponse(message) {
  const m = message.toLowerCase();
  if (m.includes('fir') || m.includes('police complaint'))         return KNOWLEDGE_BASE.fir;
  if (m.includes('affidavit') || m.includes('attestation'))        return KNOWLEDGE_BASE.affidavit;
  if (m.includes('consumer') || m.includes('cpa'))                 return KNOWLEDGE_BASE.consumer;
  if (m.includes('rti') || m.includes('right to information'))     return KNOWLEDGE_BASE.rti;
  if (m.includes('138') || m.includes('cheque') || m.includes('bounce')) return KNOWLEDGE_BASE['138'];
  if (m.includes('arrest') || m.includes('detention'))             return KNOWLEDGE_BASE.arrest;
  if (m.includes('legal notice') || m.includes('notice format'))   return `A Legal Notice should include:\n\n1. Name and address of sender\n2. Name and address of recipient\n3. Date of notice\n4. Facts of the dispute (briefly)\n5. Demand / relief sought\n6. Time period to comply (usually 15–30 days)\n7. Consequences of non-compliance\n8. Signature of the advocate/sender\n\nLegal notices are typically sent via Registered Post with Acknowledgement Due (RPAD) to create a legal record. Consult an advocate to draft one for your specific situation.`;
  return KNOWLEDGE_BASE.default;
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'नमस्ते! 🙏 I\'m your JustEase Legal Assistant.\n\nI can help you understand Indian legal procedures, document requirements, and your rights. Ask me anything about:\n• Filing FIRs, RTIs, consumer complaints\n• Affidavit preparation & attestation\n• Cheque bounce (Section 138)\n• Arrest rights & CrPC procedures\n• Consumer Protection Act 2019\n\nHow can I assist you today?',
    },
  ]);
  const [input,    setInput]    = useState('');
  const [typing,   setTyping]   = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text = input) => {
    const msg = text.trim();
    if (!msg) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setTyping(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: 'ai', text: getResponse(msg) }]);
      setTyping(false);
    }, 900 + Math.random() * 400);
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>Legal Assistant 💬</h1>
        <p>AI-powered legal guidance in English & Hindi</p>
      </div>

      <div className="disclaimer">
        ⚠️ <div>This AI assistant provides general legal information for educational purposes only. It does not constitute professional legal advice. Consult a registered advocate for your specific situation.</div>
      </div>

      <div className="card">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: 'var(--navy)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>⚖️</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>JustEase Legal AI</div>
              <div style={{ fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                Online
              </div>
            </div>
          </div>
          <span className="ai-chip">✨ AI-powered</span>
        </div>

        {/* Messages */}
        <div className="chat-wrap">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              {m.role === 'ai' && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, marginRight: 8, alignSelf: 'flex-end' }}>⚖️</div>
              )}
              <div className={`chat-bubble ${m.role}`} style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
            </div>
          ))}
          {typing && (
            <div className="chat-msg">
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, marginRight: 8 }}>⚖️</div>
              <div className="chat-bubble ai" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '12px 16px' }}>
                {[0, 150, 300].map(d => (
                  <span key={d} style={{
                    width: 7, height: 7, borderRadius: '50%', background: 'var(--text3)',
                    animation: 'bounce 1.2s infinite', animationDelay: `${d}ms`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, fontWeight: 500 }}>QUICK QUESTIONS</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => send(q)} style={{
                padding: '5px 11px', background: 'var(--cream)', border: '1px solid var(--cream3)',
                borderRadius: 20, fontSize: 12, cursor: 'pointer', color: 'var(--text2)',
                fontFamily: 'var(--font-body)', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.target.style.background = 'var(--navy)'; e.target.style.color = '#fff'; e.target.style.borderColor = 'var(--navy)'; }}
                onMouseLeave={e => { e.target.style.background = 'var(--cream)'; e.target.style.color = 'var(--text2)'; e.target.style.borderColor = 'var(--cream3)'; }}
              >{q}</button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={{
              flex: 1, padding: '11px 14px', border: '1.5px solid var(--cream3)',
              borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-body)',
              background: 'var(--white)', outline: 'none', transition: 'border-color 0.18s',
            }}
            placeholder="Ask about legal procedures, rights, documents..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e => e.target.style.borderColor = 'var(--cream3)'}
          />
          <button className="btn btn-primary" onClick={() => send()} disabled={!input.trim() || typing}>
            Send →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
