import React from 'react';
import LoginForm from "./LoginForm";
import { GoogleLogin } from 'react-google-login';
import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";

const USER_EXIST = gql`
  query getUserBy($param: String!, $value: String!) {
    getUserBy(param: $param, value: $value) {
      email
    }
  }
`;

const ADD_USER = gql`
  mutation addUser($input: UserInput!) {
    addUser(input: $input) {
      id
      profile_photo
    }
  }
`;

const GET_CURRENT = gql`
  query getCurrentUser {
    getCurrentUser {
      id
      email
    }
  }
`;

class SignInOrSignUp extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            checkExistence: false,
            toDashboard: false,
            email: "",
            firstName: "",
            lastName: "",
            username: "",
            location: "",
            type: "",
            profile_photo: ""
        }
    }

    onSuccess = async googleUser => {
    const email = googleUser.profileObj.email;
    const idToken = googleUser.getAuthResponse().id_token;
    localStorage.setItem("token", idToken);

    this.getCurrentUser(idToken)

    const client = new ApolloClient({
      uri: process.env.REACT_APP_DEV_URL,
      headers: { authorization: idToken}
    });

    client
      .query({
        query: USER_EXIST,
        variables: {
          param: "email",
          value: email
        }
      })
      .then(response => {
        if (response.data.getUserBy) this.setState({ toDashboard: !this.state.toDashboard });
        else this.setState({ checkExistence: !this.state.checkExistence });
      })
      .catch(err => console.log(err));
    };

    getCurrentUser = idToken => {
        const client = new ApolloClient({
          uri: process.env.REACT_APP_DEV_URL,
          headers: { authorization: idToken }
        });

        client
          .query({
            query: GET_CURRENT
          })
          .then(response => {
            console.log(response);
          })
          .catch(err => console.log("user", err));
      };
    createUser = userObj => {
        const client = new ApolloClient({
          uri: process.env.REACT_APP_DEV_URL
        });

        client
          .mutate({
            mutation: ADD_USER,
            variables: {
              input: userObj
            }
          })
          .then(response => {
            console.log(response)
            this.setState({
              toDashboard: !this.state.toDashboard
            })
          })
          .catch(err => {
              console.log("create", err)
          });
    };

    handleChange = (label, value) => {
        this.setState({
          [label]: value
        });
      };


    render(){
        if (this.state.toDashboard === true) {
          this.props.history.push('/dashboard')
        }
        return(
            <div>
                <div>
                    <h1 style={{color:"white", marginTop:0}}>Welcome to MusicMap!</h1>
                </div>
                <div>
                    { this.state.checkExistence ? (
                        <LoginForm handleChange={this.handleChange} addUser={this.createUser} props={this.state}/>
                    ) : (
                        <GoogleLogin
                            clientId={process.env.REACT_APP_OAUTH_CLIENT_ID}
                            onSuccess={this.onSuccess}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default SignInOrSignUp;