import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const { data } = useSession()
  return (
    <div className={styles.container} style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", alignItems: "center", height: "100%"}}>
      <Link href="/redirects/login"><a>
        Login
      </a>
      </Link>

      <Link href="/api/download"><a>
        Download Clipture
      </a>
      </Link>
      {data?.user?.name}
    </div>
  )
}

export default Home
