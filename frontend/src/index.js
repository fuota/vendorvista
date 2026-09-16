import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './bootstrap.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { Provider } from 'react-redux';
import store from './store';

// In dev, CRA's package.json "proxy" forwards relative /api/ calls to the
// local Django server, so this stays empty. In production the frontend and
// backend are separate deployments, so this points axios at the deployed
// backend's URL instead.
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
