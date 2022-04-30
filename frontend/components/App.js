import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from 'axios';
import axiosWithAuth from '../axios/index';

const articlesUrl = 'http://localhost:9000/api/articles';
const loginUrl = 'http://localhost:9000/api/login';

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('');
  const [articles, setArticles] = useState([]);
  const [currentArticleId, setCurrentArticleId] = useState();
  const [spinnerOn, setSpinnerOn] = useState(false);

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate();
  const redirectToLogin = () => { 
      navigate('/');
     };
  const redirectToArticles = () => { 
    navigate('/articles');
   }

  const logout = () => {
    window.localStorage.removeItem('token');
        setMessage('Goodbye!');
        redirectToLogin();
  }

  const login = ({ username, password }) => {
    setMessage('');
      setSpinnerOn(true);
      axios
          .post(loginUrl, { username, password })
          .then((res) => {
              window.localStorage.setItem('token', res.data.token);
              setMessage(res.data.message);
              redirectToArticles();
          })
          .catch((err) => {
              setMessage(err.response.data.message);
          })
          .finally(() => {
              setSpinnerOn(false);
          });
     
  };

  const getArticles = () => {
    setMessage('');
        setSpinnerOn(true);
        axiosWithAuth()
            .get(articlesUrl)
            .then((res) => {
                setArticles(res.data.articles);
                setMessage(res.data.message);
            })
            .catch((err) => {
                if (err.resp.status === 401) {
                    redirectToLogin();
                } else {
                    setMessage(err.res.data.message);
                }
            })
            .finally(() => {
                setSpinnerOn(false);
            });
  }

  const postArticle = article => {
    axiosWithAuth()
            .post(articlesUrl, article)
            .then((res) => {
                setArticles([...articles, res.data.article]);
                setMessage(res.data.message);
            })
            .catch((err) => {
                setMessage(err.response.data.message);
            });
    
  }

  const updateArticle = ({ article_id, article }) => {
    setSpinnerOn(true);
    axiosWithAuth()
        .put(`${articlesUrl}/${article_id}`, {
            title: article.title,
            text: article.text,
            topic: article.topic,
        })
        .then((res) => {
            setArticles(
                articles.map((art) => {
                    return art.article_id === article_id ? res.data.article : art;
                })
            );
            setMessage(res.data.message);
            setCurrentArticleId();
        })
        .catch((err) => {
            setMessage(err?.response?.data?.message);
        })
        .finally(() => setSpinnerOn(false));
    
  }

  const deleteArticle = article_id => {
    setSpinnerOn(true)
    axiosWithAuth().delete(`${articlesUrl}/${article_id}`)
      .then(res => {
        setMessage(res.data.message)
        setArticles(articles.filter(art => {
          return art.article_id !== article_id
        }))
      })
      .catch(err => {
        setMessage(err?.response?.data?.message)
      })
      .finally(() => {
        setSpinnerOn(false)
      })

  }

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <React.StrictMode>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={ login }/>} />
          <Route path="articles" element={
            <>
              <ArticleForm
                  article={articles.find((art) => {
                    return art.article_id === currentArticleId;
                  })}
                  postArticle={postArticle}
                  setCurrentArticleId={setCurrentArticleId}
                  updateArticle={updateArticle}
              />
              <Articles
                  getArticles={getArticles}
                  articles={articles}
                  deleteArticle={deleteArticle}
                  setCurrentArticleId={setCurrentArticleId}
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </React.StrictMode>
  )
}
