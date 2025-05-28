'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { AuthService } from '@/lib/authService';

export default function UserProfile() {
  const [name, setName] = useState<string>('Loading...');
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = () => {
    AuthService.logout();
    router.replace('/login');
  };

  const handleSave = () => {
    setName(input.trim() || name);
    setEditing(false);
  };

  const fetchUser = async () => {
    const result = await AuthService.getUserDetails();
    if (result.success && result.data) {
      setName(result.data.name);
      setInput(result.data.name);
    } else {
      console.error('Failed to fetch user details:', result.error);
      handleLogout(); // optional fallback
    }
  };


  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
        setEditing(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 bg-white hover:ring-2 hover:ring-blue-500"
      >
        <img
          src="/user-avatar.png"
          alt="User avatar"
          className="object-cover w-full h-full"
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-xl z-50 py-4 px-6">
          <div className="flex flex-col items-center text-center">
            <img
              src="/user-avatar.png"
              alt="User avatar"
              className="w-16 h-16 rounded-full border mb-2"
            />

            <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-900">
              <span className="text-gray-700">Hi,</span>
              {editing ? (
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onBlur={handleSave}
                  autoFocus
                  className="border text-center px-2 py-1 rounded text-sm w-36"
                />
              ) : (
                <>
                  <span>{name}</span>
                  <button onClick={() => setEditing(true)} title="Edit name">
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => router.push('/billing')}
            >
              Billing
            </button>
          </div>

          <hr className="my-4" />

          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
