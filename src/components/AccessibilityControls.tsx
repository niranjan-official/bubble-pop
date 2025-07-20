import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Eye, Volume2, Hand, Type, Zap } from 'lucide-react';
import { AccessibilitySettings } from '../types/game';

interface AccessibilityControlsProps {
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function AccessibilityControls({
  settings,
  onSettingsChange,
  isOpen,
  onToggle
}: AccessibilityControlsProps) {
  const toggleSetting = (key: keyof AccessibilitySettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key]
    });
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={onToggle}
        className="large-target bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg focus-visible:focus transition-colors"
        aria-label="Open accessibility controls"
        title="Accessibility Controls"
      >
        <Settings size={24} />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          className="absolute top-16 right-0 bg-white rounded-lg shadow-xl p-6 min-w-80 border"
        >
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            Accessibility Options
          </h3>
          
          <div className="space-y-4">
            <ControlToggle
              icon={<Eye size={20} />}
              label="High Contrast Mode"
              description="Increases visual contrast for better visibility"
              checked={settings.highContrast}
              onChange={() => toggleSetting('highContrast')}
            />
            
            <ControlToggle
              icon={<Zap size={20} />}
              label="Reduced Motion"
              description="Minimizes animations and movement"
              checked={settings.reducedMotion}
              onChange={() => toggleSetting('reducedMotion')}
            />
            
            <ControlToggle
              icon={<Type size={20} />}
              label="Large Text"
              description="Increases text size for better readability"
              checked={settings.largeText}
              onChange={() => toggleSetting('largeText')}
            />
            
            <ControlToggle
              icon={<Volume2 size={20} />}
              label="Voice Commands"
              description="Enables voice recognition for game control"
              checked={settings.voiceEnabled}
              onChange={() => toggleSetting('voiceEnabled')}
            />
            
            <ControlToggle
              icon={<Hand size={20} />}
              label="Gesture Control"
              description="Enables hand gesture recognition"
              checked={settings.gestureEnabled}
              onChange={() => toggleSetting('gestureEnabled')}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface ControlToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ControlToggle({ icon, label, description, checked, onChange }: ControlToggleProps) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 text-blue-600 mt-1">
        {icon}
      </div>
      <div className="flex-1">
        <label className="flex items-center cursor-pointer">
          <div className="flex-1">
            <div className="font-medium text-gray-800">{label}</div>
            <div className="text-sm text-gray-600">{description}</div>
          </div>
          <div className="ml-4">
            <input
              type="checkbox"
              checked={checked}
              onChange={onChange}
              className="sr-only"
            />
            <div
              className={`relative w-12 h-6 rounded-full transition-colors ${
                checked ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  checked ? 'transform translate-x-6' : ''
                }`}
              />
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}