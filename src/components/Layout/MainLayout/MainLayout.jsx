import styles from './MainLayout.module.css';
import Navbar from '../Navbar/Navbar.jsx';
export default function MainLayout({children}){
    return(
        <div className={styles.mainlayout}>
                <Navbar/>
                <div className={styles.maincontent}>
                    {children}
                </div>
        </div>
    )
}