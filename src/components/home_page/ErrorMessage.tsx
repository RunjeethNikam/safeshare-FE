// src/components/home_page/ErrorMessage.tsx
import React from 'react';
import styles from "@/styles/MediaGallery.module.css";

interface ErrorMessageProps {
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export default function ErrorMessage({ error, setError }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div className={styles.errorMessage}>
      <p>{error}</p>
      <button onClick={() => setError('')} className={styles.closeError}>×</button>
    </div>
  );
}