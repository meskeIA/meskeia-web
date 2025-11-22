'use client'

import MeskeiaLogo from './MeskeiaLogo'
import HeaderActions from './HeaderActions'
import styles from './FixedHeader.module.css'

export default function FixedHeader() {
  return (
    <header className={styles.fixedHeader}>
      <div className={styles.headerContainer}>
        <MeskeiaLogo />
        <HeaderActions />
      </div>
    </header>
  )
}
