'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './DailyApps.module.css';
import { getDailyApps } from '@/lib/dailyApps';
import type { Application } from '@/data/applications';

interface DailyAppsProps {
  count?: number;
}

export default function DailyApps({ count = 4 }: DailyAppsProps) {
  const [dailyApps, setDailyApps] = useState<Application[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Obtener las apps del día
    const apps = getDailyApps(count);
    setDailyApps(apps);
  }, [count]);

  // Skeleton loader mientras carga (efecto shimmer)
  if (!mounted) {
    return (
      <section className={styles.dailyAppsSection} aria-busy="true" aria-label="Cargando apps del día">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleIcon}>✨</span>
            Apps del día
          </h2>
          <span className={styles.refreshInfo}>
            🔄 Cambian cada día
          </span>
        </div>
        <div className={styles.appsGrid}>
          {[...Array(count)].map((_, i) => (
            <div key={i} className={styles.cardSkeleton} aria-hidden="true">
              <div className={styles.skeletonHeader}>
                <div className={styles.skeletonIcon} />
                <div className={styles.skeletonTitle} />
              </div>
              <div className={styles.skeletonDescription} />
              <div className={styles.skeletonDescription} />
              <div className={styles.skeletonCategory} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.dailyAppsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.titleIcon}>✨</span>
          Apps del día
        </h2>
        <span className={styles.refreshInfo}>
          🔄 Cambian cada día
        </span>
      </div>

      <div className={styles.appsGrid}>
        {dailyApps.map((app) => (
          <Link
            key={app.url}
            href={app.url}
            className={styles.appCard}
          >
            <div className={styles.cardHeader}>
              <span className={styles.appIcon}>{app.icon}</span>
              <span className={styles.appName}>{app.name}</span>
            </div>
            <p className={styles.appDescription}>
              {app.description}
            </p>
            <span className={styles.appCategory}>
              📁 {app.category}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
