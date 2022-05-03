import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { useState } from 'react';

import { getPrismicClient } from '../services/prismic';
import { format } from 'date-fns';
import { FiCalendar, FiUser } from 'react-icons/fi';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { ptBR } from 'date-fns/locale';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  console.log(postsPagination);

  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  return (
    <>
      <Head>
        <title>Início</title>
      </Head>
      <main className={`${styles.container} ${commonStyles.maxContainer}`}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href="/" key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <span>
                    <FiCalendar color="#BBBBBB" size={20} />{' '}
                    {post.first_publication_date}
                  </span>
                  <span>
                    <FiUser color="#BBBBBB" size={20} /> {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>
        <button className={styles.loadMoreButton}>Carregar mais posts</button>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('desafio-posts', {
    pageSize: 2,
  });

  const results = postsResponse.results.map(result => ({
    first_publication_date: format(
      new Date(result.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: result.data.title[0].text,
      subtitle: result.data.subtitle[0].text,
      author: result.data.author[0].text,
    },
  }));

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
