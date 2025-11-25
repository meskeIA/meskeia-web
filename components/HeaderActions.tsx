'use client'

import Link from 'next/link'
import SearchBar from './SearchBar'
import styles from './HeaderActions.module.css'

export default function HeaderActions() {
  return (
    <div className={styles.headerActions}>
      <div className={styles.searchWrapper}>
        <SearchBar />
      </div>
      {/* Temporalmente oculto hasta completar todas las guías */}
      {/* <Link href="/guias" className={styles.guidesButton}>
        <span className={styles.guidesIcon}>📚</span>
        <span className={styles.guidesText}>Guías</span>
      </Link> */}
    </div>
  )
}
