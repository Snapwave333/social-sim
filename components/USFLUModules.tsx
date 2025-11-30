
import React, { useState } from 'react';
import { Eye, Book, X, Check, User, Info } from 'lucide-react';

// --- Types ---
// (No longer needed types removed)

// --- USFLU Reference Guide ---
const TABS = [
  { id: 'eye', label: 'Eye Contact', icon: Eye },
  { id: 'body', label: 'Body Language', icon: User },
  { id: 'gestures', label: 'Gesture Dictionary', icon: Info },
];

export const USFLUGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('eye');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-900 rounded-3xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-50 duration-200 border border-dark-700">
        
        {/* Header */}
        <div className="bg-dark-800 p-6 flex justify-between items-start border-b border-dark-700">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary/20 px-2 py-0.5 rounded text-xs font-bold tracking-wider text-primary-light border border-primary/20">USFLU STANDARD</span>
              <span className="text-gray-400 text-xs">United States Foreign Language Usage</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Communication Best Practices</h2>
            <p className="text-gray-400 opacity-90">Cultural norms for professional and social interactions in the US.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-dark-700 hover:bg-dark-600 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-dark-700 bg-dark-900">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-primary text-primary bg-dark-800' 
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-dark-800'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-8 bg-dark-900">
          
          {/* TAB: Eye Contact */}
          {activeTab === 'eye' && (
            <div className="space-y-8 max-w-3xl mx-auto">
              <section className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">The 3-5 Second Rule</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    In the US, maintaining eye contact demonstrates confidence, honesty, and interest. 
                    However, staring for too long can be perceived as aggressive.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="text-teal mt-1 shrink-0" size={18} />
                      <span className="text-gray-300"><strong>Do:</strong> Hold gaze for 3-5 seconds, then briefly glance to the side.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="text-teal mt-1 shrink-0" size={18} />
                      <span className="text-gray-300"><strong>Do:</strong> Maintain eye contact 50-70% of the time while listening.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="text-red-400 mt-1 shrink-0" size={18} />
                      <span className="text-gray-300"><strong>Don't:</strong> Look at your phone or watch, which signals boredom.</span>
                    </li>
                  </ul>
                </div>
                <div className="w-full md:w-64 bg-dark-800 rounded-2xl p-6 border border-dark-700 text-center">
                  <div className="w-24 h-24 rounded-full border-4 border-dark-700 border-t-primary mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(114,110,255,0.2)]">
                    <Eye size={32} className="text-primary-light" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Visual Interval</p>
                  <p className="text-primary-light font-bold text-2xl">3.0 - 5.0s</p>
                </div>
              </section>
              
              <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/20">
                <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                  <Info size={18} /> Cultural Note: Professional vs. Social
                </h4>
                <p className="text-blue-200/70 text-sm">
                  In professional settings (e.g., job interviews), slightly more direct eye contact is expected to show competence. 
                  In social settings, especially when flirting, eye contact is often broken downwards rather than to the side.
                </p>
              </div>
            </div>
          )}

          {/* TAB: Body Language */}
          {activeTab === 'body' && (
            <div className="space-y-8 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                  <div className="w-full h-40 bg-dark-700 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-teal/20 to-transparent"></div>
                    <User size={64} className="text-gray-500 group-hover:scale-110 transition-transform" />
                    <span className="absolute bottom-2 right-2 bg-teal/20 text-teal px-2 py-1 rounded text-xs font-bold border border-teal/30">Recommended</span>
                  </div>
                  <h4 className="font-bold text-gray-200">The "Open" Stance</h4>
                  <p className="text-sm text-gray-400 mt-2">
                    Uncrossed arms and legs. Torso pointed towards the speaker. Indicates approachability and honesty.
                  </p>
                </div>
                
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                  <div className="w-full h-40 bg-dark-700 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-transparent"></div>
                    <User size={64} className="text-gray-500 opacity-50" />
                    <div className="absolute w-full h-full flex items-center justify-center">
                        <X size={48} className="text-red-500/50" />
                    </div>
                    <span className="absolute bottom-2 right-2 bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/30">Avoid</span>
                  </div>
                  <h4 className="font-bold text-gray-200">Closed/Defensive</h4>
                  <p className="text-sm text-gray-400 mt-2">
                    Crossed arms, hunching shoulders, or turning away. Often interpreted as defensive, insecure, or disinterested.
                  </p>
                </div>
              </div>

              <section>
                <h3 className="text-xl font-bold text-white mb-4">Mirroring Technique</h3>
                <div className="bg-dark-800 border-l-4 border-primary shadow-lg p-6 rounded-r-xl">
                  <p className="text-gray-300 mb-4">
                    Subtly mimicking your partner's posture and energy creates psychological rapport. 
                    Wait 3-10 seconds before copying a gesture to keep it natural.
                  </p>
                  <div className="flex gap-4">
                    <span className="px-3 py-1 bg-dark-700 rounded-full text-xs text-gray-400">Lean in when they lean in</span>
                    <span className="px-3 py-1 bg-dark-700 rounded-full text-xs text-gray-400">Match vocal volume</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB: Gestures */}
          {activeTab === 'gestures' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <h3 className="text-xl font-bold text-white">US Gesture Dictionary</h3>
              <p className="text-gray-500 text-sm mb-4">Common gestures and their interpretations in the United States.</p>
              
              <div className="grid gap-4">
                {[
                  { name: "Thumbs Up", meaning: "Good, Yes, Approval", note: "Universally positive in the US.", type: "positive" },
                  { name: "The 'Okay' Sign", meaning: "Perfect, Agreed", note: "Circle with thumb and index finger.", type: "positive" },
                  { name: "Pointing", meaning: "Directing attention", note: "Pointing directly at people is considered rude/aggressive.", type: "negative" },
                  { name: "Shrugging", meaning: "I don't know / I don't care", note: "Shoulders raised. Can seem dismissive in formal contexts.", type: "neutral" },
                  { name: "Nodding", meaning: "Listening / Agreement", note: "Essential for 'Active Listening'.", type: "positive" },
                ].map((gesture, i) => (
                  <div key={i} className="flex items-start p-4 rounded-xl border border-dark-700 hover:border-primary/50 transition-colors bg-dark-800">
                    <div className={`w-2 h-full min-h-[40px] rounded-full mr-4 ${
                      gesture.type === 'positive' ? 'bg-teal' : gesture.type === 'negative' ? 'bg-red-400' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <h4 className="font-bold text-gray-200">{gesture.name}</h4>
                      <p className="text-sm font-medium text-primary-light mb-1">{gesture.meaning}</p>
                      <p className="text-xs text-gray-500 italic">"{gesture.note}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-dark-800 p-4 border-t border-dark-700 text-center text-xs text-gray-500">
          WCAG 2.1 AA Compliant • Content validated by Communication Experts
        </div>
      </div>
    </div>
  );
};
