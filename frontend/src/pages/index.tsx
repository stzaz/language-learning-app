import type { NextPage } from 'next';
import Head from 'next/head';
import AddBookForm from '../components/AddBookForm';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Language Learning App</title>
                <meta name="description" content="Learn languages by reading books" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Welcome to the Language Learning App</h1>
                <AddBookForm />
            </main>
        </div>
    );
};

export default Home;

