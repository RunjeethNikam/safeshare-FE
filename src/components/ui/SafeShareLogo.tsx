// src/components/ui/SafeShareLogo.tsx
export default function SafeShareLogo() {
  return (
    <div className="flex items-center justify-center">
      <div className="grid grid-cols-2 gap-1 w-12 h-12">
        {/* Top Left - Shield/Security */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-sm flex items-center justify-center relative overflow-hidden">
          {/* Lock icon */}
          <div className="relative">
            <div className="w-2 h-1.5 bg-white rounded-sm"></div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1 border border-white rounded-t-full bg-transparent"></div>
          </div>
          {/* Subtle shine effect */}
          <div className="absolute top-0 left-0 right-1/2 bottom-1/2 bg-white/20 rounded-sm"></div>
        </div>
        
        {/* Top Right - Cloud Storage */}
        <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-sm flex items-center justify-center relative overflow-hidden">
          {/* Cloud shape */}
          <div className="relative">
            <div className="w-2.5 h-1 bg-white rounded-full"></div>
            <div className="absolute -top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full"></div>
            <div className="absolute -top-0.5 right-0.5 w-1 h-1 bg-white rounded-full"></div>
          </div>
          {/* Subtle shine effect */}
          <div className="absolute top-0 left-0 right-1/2 bottom-1/2 bg-white/20 rounded-sm"></div>
        </div>
        
        {/* Bottom Left - File Sharing */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-sm flex items-center justify-center relative overflow-hidden">
          {/* File with arrow */}
          <div className="relative">
            <div className="w-1.5 h-2 bg-white rounded-sm"></div>
            <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
              <div className="w-1 h-0.5 bg-white rounded-full"></div>
              <div className="absolute -right-0.5 -top-0.5 w-0 h-0 border-l border-l-white border-t border-t-transparent border-b border-b-transparent"></div>
            </div>
          </div>
          {/* Subtle shine effect */}
          <div className="absolute top-0 left-0 right-1/2 bottom-1/2 bg-white/20 rounded-sm"></div>
        </div>
        
        {/* Bottom Right - Network/Users */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-sm flex items-center justify-center relative overflow-hidden">
          {/* Connected dots representing network */}
          <div className="relative">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute -right-1 -top-0.5 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute -right-0.5 top-1 w-0.5 h-0.5 bg-white rounded-full"></div>
            {/* Connection lines */}
            <div className="absolute top-0.5 left-0.5 w-0.5 h-px bg-white transform rotate-45"></div>
            <div className="absolute top-0.5 left-0.5 w-0.5 h-px bg-white transform -rotate-45"></div>
          </div>
          {/* Subtle shine effect */}
          <div className="absolute top-0 left-0 right-1/2 bottom-1/2 bg-white/20 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
}

// Alternative with more distinct icons
export function SafeShareLogoDetailed() {
  return (
    <div className="flex items-center justify-center">
      <div className="grid grid-cols-2 gap-1.5 w-14 h-14">
        {/* Top Left - Security Shield */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Top Right - Cloud Storage */}
        <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
          </svg>
        </div>
        
        {/* Bottom Left - File Sharing */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
        </div>
        
        {/* Bottom Right - Network/Team */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Simplified version with better contrast
export function SafeShareLogoSimple() {
  return (
    <div className="flex items-center justify-center">
      <div className="grid grid-cols-2 gap-1 w-12 h-12">
        {/* Security - Blue */}
        <div className="bg-blue-600 rounded-sm flex items-center justify-center">
          <div className="text-white text-xs font-bold">🔒</div>
        </div>
        
        {/* Cloud - Cyan */}
        <div className="bg-cyan-500 rounded-sm flex items-center justify-center">
          <div className="text-white text-xs font-bold">☁️</div>
        </div>
        
        {/* Share - Green */}
        <div className="bg-emerald-600 rounded-sm flex items-center justify-center">
          <div className="text-white text-xs font-bold">📤</div>
        </div>
        
        {/* Network - Purple */}
        <div className="bg-purple-600 rounded-sm flex items-center justify-center">
          <div className="text-white text-xs font-bold">👥</div>
        </div>
      </div>
    </div>
  );
}