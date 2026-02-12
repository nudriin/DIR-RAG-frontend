import { useState, type ReactNode } from 'react';
import '../styles/components.css';

interface CollapsibleProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function Collapsible({ title, children, defaultOpen = false }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`collapsible ${open ? 'is-open' : ''}`}>
      <button className="collapsible-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="collapsible-icon">▼</span>
      </button>
      <div className="collapsible-body">
        <div className="collapsible-content">
          {children}
        </div>
      </div>
    </div>
  );
}
