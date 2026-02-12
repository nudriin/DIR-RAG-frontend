import '../styles/components.css';

interface SpinnerProps {
  text?: string;
  small?: boolean;
}

export default function Spinner({ text = 'Memuat...', small }: SpinnerProps) {
  if (small) {
    return <span className="spinner spinner-sm" />;
  }
  return (
    <div className="spinner-overlay">
      <span className="spinner" />
      <span>{text}</span>
    </div>
  );
}
