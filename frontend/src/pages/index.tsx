import type { NextPage } from 'next';
import Head from 'next/head';
import AddBookForm from '../components/AddBookForm';
import BookList from '../components/BookList';
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
                <hr style={{ width: '100%', margin: '2rem 0' }} />
                <AddBookForm />
                <hr style={{ width: '100%', margin: '2rem 0' }} />
                <BookList />
            </main>
        </div>
    );
};

export default Home;

