// Componente reutilizable para cajas de información en páginas legales

import { ReactNode } from 'react';
import styles from './InfoBox.module.css';

type BoxType = 'info' | 'warning' | 'success' | 'medical';

interface InfoBoxProps {
  type: BoxType;
  title: string;
  icon?: string;
  children: ReactNode;
}

export default function InfoBox({ type, title, icon, children }: InfoBoxProps) {
  const boxClass = styles[`${type}Box`];
  const titleClass = styles[`${type}Title`];

  return (
    <div className={boxClass}>
      <div className={titleClass}>
        {icon && <span>{icon}</span>}
        {title}
      </div>
      <div className={styles.boxContent}>
        {children}
      </div>
    </div>
  );
}
