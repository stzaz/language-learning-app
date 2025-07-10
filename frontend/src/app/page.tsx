import Head from 'next/head';
import BookList from '../components/BookList';

const Home = () => {
    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
            <Head>
                <title>The Living Library</title>
                <meta name="description" content="Learn languages by reading books" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="container mx-auto px-4 py-12">
                <h1 className="text-5xl font-bold text-center mb-12 text-slate-900 dark:text-white">
                    The Living Library
                </h1>
                <BookList />
            </main>
        </div>
    );
};

export default Home;

