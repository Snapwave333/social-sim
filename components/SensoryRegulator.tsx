
import React, { useState, useEffect } from 'react';
import { Sliders, EyeOff, Activity, Zap } from 'lucide-react';

interface SensorySettings {
  animationSpeed: number; // 0.5 (fast) to 2.0 (slow)
  colorFilter: 'none' | 'calm' | 'mono';
  hapticsEnabled: boolean;
}

interface SensoryRegulatorProps {
  onSettingsChange: (settings: SensorySettings) => void;
}

const SensoryRegulator: React.FC<SensoryRegulatorProps> = ({ onSettingsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTriggerVisible, setIsTriggerVisible] = useState(false);
  const [settings, setSettings] = useState<SensorySettings>({
    animationSpeed: 1.0,
    colorFilter: 'none',
    hapticsEnabled: true,
  });

  // Handle inactivity trigger visibility
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleActivity = () => {
      setIsTriggerVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsTriggerVisible(false), 3000); // Hide after 3s of inactivity
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('click', handleActivity);
    
    // Initial show
    handleActivity();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearTimeout(timeout);
    };
  }, []);

  const updateSetting = (key: keyof SensorySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-[200] bg-deep/95 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
        <div className="max-w-md w-full border-4 border-white p-8 relative">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute -top-4 -right-4 bg-white text-deep p-2 border-2 border-deep hover:bg-gray-200"
          >
            <EyeOff size={24} />
          </button>
          
          <div className="flex items-center gap-3 mb-8 text-white">
            <Activity size={32} className="text-white" />
            <h2 className="font-display text-2xl uppercase tracking-widest">Sensory_Regulator</h2>
          </div>

          <div className="space-y-8">
            {/* Animation Damping */}
            <div>
              <label className="flex justify-between text-white font-mono text-xs uppercase mb-2">
                <span>Visual Velocity Damping</span>
                <span>{settings.animationSpeed}x</span>
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.5"
                value={settings.animationSpeed}
                onChange={(e) => updateSetting('animationSpeed', parseFloat(e.target.value))}
                className="w-full h-4 bg-deep border-2 border-white appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white"
              />
            </div>

            {/* Color Filter */}
            <div>
              <label className="text-white font-mono text-xs uppercase mb-2 block">Spectral Output</label>
              <div className="flex gap-2">
                {(['none', 'calm', 'mono'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateSetting('colorFilter', mode)}
                    className={`flex-1 py-3 border-2 font-mono text-xs uppercase transition-all ${
                      settings.colorFilter === mode 
                        ? 'bg-white text-deep border-white' 
                        : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Haptics */}
            <div className="flex items-center justify-between">
               <span className="text-white font-mono text-xs uppercase">Haptic/Audio Feedback</span>
               <button 
                 onClick={() => updateSetting('hapticsEnabled', !settings.hapticsEnabled)}
                 className={`w-12 h-6 border-2 border-white relative transition-colors ${settings.hapticsEnabled ? 'bg-white' : 'bg-transparent'}`}
               >
                 <div className={`absolute top-0.5 bottom-0.5 w-4 bg-deep transition-all ${settings.hapticsEnabled ? 'right-0.5 bg-deep' : 'left-0.5 bg-white'}`}></div>
               </button>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/20 text-white/40 font-mono text-[10px] text-center">
             SYSTEM LAYER v0.9 // NON-INTRUSIVE CONFIG
          </div>
        </div>
      </div>
    );
  }

  // The hidden trigger
  return (
    <button
      onClick={() => setIsOpen(true)}
      className={`fixed bottom-4 left-4 z-[90] text-gray-400 hover:text-white transition-opacity duration-1000 p-2 ${
        isTriggerVisible ? 'opacity-30 hover:opacity-100' : 'opacity-0'
      }`}
      aria-label="Open Sensory Settings"
    >
      <Zap size={16} strokeWidth={1} />
    </button>
  );
};

export default SensoryRegulator;
