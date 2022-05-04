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

type NextPage = string | null;

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<NextPage>(postsPagination.next_page);

  async function handleLoadMorePosts() {
    const data = await fetch(`${nextPage}`).then(response => response.json());

    const newPosts = data.results.map(post => ({
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title[0].text || post.data.title,
        subtitle: post.data.subtitle[0].text || post.data.subtitle,
        author: post.data.author[0].text || post.data.author,
      },
    }));

    console.log(data);

    setPosts([...posts, ...newPosts]);
    setNextPage(data.next_page);
  }

  return (
    <>
      <Head>
        <title>Início</title>
      </Head>
      <main className={`${styles.container} ${commonStyles.maxContainer}`}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <span>
                    <FiCalendar color="#BBBBBB" size={20} />{' '}
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </span>
                  <span>
                    <FiUser color="#BBBBBB" size={20} /> {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {!!nextPage && (
          <button
            className={styles.loadMoreButton}
            onClick={handleLoadMorePosts}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('desafio-posts', {
    pageSize: 1,
  });

  const results = postsResponse.results.map(result => ({
    uid: result.uid,
    first_publication_date: result.first_publication_date,
    data: {
      title: result.data.title[0].text || result.data.title,
      subtitle: result.data.subtitle[0].text || result.data.subtitle,
      author: result.data.author[0].text || result.data.author,
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
