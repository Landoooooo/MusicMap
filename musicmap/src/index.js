import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css';
import App from './App';

import { ApolloProvider } from "react-apollo";
import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache, IntrospectionFragmentMatcher } from "apollo-cache-inmemory";

import introspectionResult from './graphql.schema.json';

import * as serviceWorker from './serviceWorker';

const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData: introspectionResult,
})

const httpLink = createHttpLink({
    uri: process.env.REACT_APP_DEV_URL
});

const cache = new InMemoryCache({
    fragmentMatcher
})

const client = new ApolloClient({
    cache,
    link: httpLink,
    fetchOptions: {
        mode: 'no-cors'
    }
})

ReactDOM.render(
    <ApolloProvider client={client}>
        <Router>
            <App />
        </Router>
    </ApolloProvider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
