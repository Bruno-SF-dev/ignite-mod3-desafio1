import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  console.log(post);

  const router = useRouter();
  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const totalWords = post.data.content.reduce((prev, content) => {
    const headingSize = content.heading.split(' ').length;
    const bodySize = content.body
      .map(bodyItem => bodyItem.text)
      .join(' ')
      .split(' ').length;
    const newPrev = prev + headingSize + bodySize;

    return newPrev;
  }, 0);

  const readTime = Math.ceil(
    totalWords / 200 // considerando que a leitura humana seja 200palavras/min
  );

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <img src={post.data.banner.url} className={styles.banner} alt="" />
      <main className={`${styles.container} ${commonStyles.maxContainer}`}>
        <h1>{post.data.title}</h1>
        <div className={styles.info}>
          <span>
            <FiCalendar color="#BBBBBB" size={20} />
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </span>
          <span>
            <FiUser color="#BBBBBB" size={20} />
            {post.data.author}
          </span>
          <span>
            <FiClock color="#BBBBBB" size={20} />
            {readTime} min
          </span>
        </div>
        {post.data.content.map(content => (
          <article>
            <h2>{content.heading}</h2>
            <div
              className={styles.body}
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            ></div>
          </article>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('desafio-posts');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('desafio-posts', `${slug}`);

  const content = response.data.content.map(content => {
    return {
      heading: content.heading[0].text || content.heading,
      body: [...content.body],
    };
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title[0].text || response.data.title,
      subtitle: response.data.subtitle[0].text || response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author[0].text || response.data.author,
      content,
    },
  };

  console.log('POST', post);

  return {
    props: { post },
  };
};
