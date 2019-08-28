import React from "react";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ApolloClient from 'apollo-boost';
import gql from "graphql-tag";

import StatusCard from "../Account/StatusCard";
import styled from "styled-components";


// Change text to query for search
const searchQuery = gql`
  query($text: String!){
    search(text: $text){
      __typename
      ... on User{
        id
        username
        type
        profile_photo
      }
      ... on Status{
        user_id
        text
        photo
        video
        audio
      }
    }
  }
`;

const CURRENT_USER = gql`
  query{
    getCurrentUser{
      id
    }
  }
`;

const ResultContainer = styled.div`
  display:flex;
  justify-content:center;
  flex-direction:column;
  align-items:center;
  flex-wrap:nowrap;
  width:100%;
  margin-top:50px;
`;


class Search extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      text: "",
      queryResult: [],
      user_id: null
    }
  }

  componentDidMount(){
    this.getUser()
  }

  getUser = () => {
    const idToken = localStorage.getItem("token");

    const client = new ApolloClient({
      uri: process.env.REACT_APP_DEV_URL,
      headers: {authorization: idToken}
    })

    client.query({
      query: CURRENT_USER
    }).then(res => {
      this.setState({
        user_id: res.data.getCurrentUser.id
      })
    })
  }


  search = e => {
    e.preventDefault();

    const client = new ApolloClient({
      uri: process.env.REACT_APP_DEV_URL
    })

    client.query({
      query: searchQuery,
      fetchPolicy: 'no-cache',
      variables: {
        text: this.state.text
      }
    }).then(response => {
      const data = response.data.search

      const userStatus = data.filter(status => status)
      const username = data.filter(user => user)

      this.setState({
        queryResult: userStatus || username
      })

      console.log(this.state.queryResult)
    }).catch(err => {
      console.log("ERROR", err)
    })
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  render(){
    return(
      <div style={{paddingTop:"100px"}}>
        <h1 style={{color:"white", marginTop:0}}>Search</h1>
        <div >
          <form onSubmit={this.search}>
            <div>
              <TextField
                id="text"
                name="text"
                value={this.state.text}
                margin="dense"
                onChange={this.handleChange}
                style={{background:"white"}}
              />
            </div>
            <div>
              <Button variant="contained" color="primary" type="submit">
                Search
              </Button>
            </div>
          </form>
          <ResultContainer>
            {
              this.state.queryResult ? (
                this.state.queryResult.map(result => {
                  return <StatusCard data={result} id={this.state.user_id}/>
                })
              ) : (
                <div>No results</div>
              )
            }
          </ResultContainer>
        </div>
      </div>
    )
  }
}




export default Search;

