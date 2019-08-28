import React from 'react';
import styled from 'styled-components';
import StatusCard from './StatusCard';
import { NavLink } from "react-router-dom";
import ApolloClient from 'apollo-boost';
import gql from "graphql-tag";

import ProfileImage from './ProfileImage';

const ProfilePhotoContainer = styled.div`
    display:flex;
    justify-content:center;
    height:150px;
    width:100%;
`;

const StatusContainer = styled.div`
  display:flex;
  justify-content:center;
  flex-direction:column;
  align-items:center;
  flex-wrap:nowrap;
  width:100%;
  margin-top:50px;
`;

const userStatus = gql`
    query($user_id: ID!){
        allStatus(user_id: $user_id){
            id
            text
            photo
            video
            audio
        }
    }
`;

const currentUserId = gql`
    {
        getCurrentUser{
            id
            username
            location
            type
            profile_photo
        }
    }
`;
class Account extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            status: [],
            userInfo: {
                id: null,
                username: "",
                location: "",
                type: "",
                profile_photo: ""
            }
        }
    }

    componentDidMount(){
        const idToken = localStorage.getItem("token");

        const client = new ApolloClient({
            uri: process.env.REACT_APP_DEV_URL,
            headers: {authorization: idToken}
        })

        client.query({
            query: currentUserId
        }).then(response => {
            console.log(response)
            this.setState({
                userInfo: {
                    id: response.data.getCurrentUser.id,
                    username: response.data.getCurrentUser.username,
                    location: response.data.getCurrentUser.location,
                    type: response.data.getCurrentUser.type,
                    profile_photo: response.data.getCurrentUser.profile_photo
                }
            })

            console.log(this.state.userInfo)

            client.query({
                query: userStatus,
                variables: {
                    user_id: parseInt(this.state.userInfo.id)
                }
            }).then(response => {
                console.log(response)
                this.setState({
                    status: response.data.allStatus
                })
            })
        })
    }

    render(){
        return(
            <div>
                { this.state.userInfo ? (
                    <div style={{paddingTop:"50px", color:"white"}}>
                        <ProfileImage image={this.state.userInfo.profile_photo} user={this.state.userInfo.username}/>
                        <p>{this.state.userInfo.username} | {this.state.userInfo.type}</p>
                        <p>{this.state.userInfo.location}</p>
                        <h2>Bio</h2>
                        <NavLink to="/settings">
                            Settings
                        </NavLink>
                    </div>
                ) : (
                    <div>
                        Loading...
                    </div>
                )

                }
                <div>
                    <StatusContainer>
                        {
                            this.state.status ? (
                                this.state.status.map(status => {
                                    console.log(status)
                                    return(
                                        <StatusCard data={status}/>
                                    )
                                })
                            ) : (
                                <div>Loading...</div>
                            )
                        }
                    </StatusContainer>
                </div>
            </div>
        )
    }
}

export default Account;