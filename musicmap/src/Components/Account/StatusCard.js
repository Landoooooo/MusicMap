import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import ApolloClient from 'apollo-boost';
import gql from "graphql-tag";

const Status =  styled.div`
    display:flex;
    justify-content:space-between;
    align-items:center;
    height:200px;
    -webkit-box-shadow: 0px 7px 11px -8px rgba(0,0,0,0.71);
    -moz-box-shadow: 0px 7px 11px -8px rgba(0,0,0,0.71);
    box-shadow: 0px 7px 11px -8px rgba(0,0,0,0.71);
    border-radius:2%;
    width:75%;
    margin-top:50px;
    background-color:white;
`;

const GET_USER = gql`
    query($userId: ID!){
        getUserById(userId: $userId){
            username
        }
    }
`;

const PIN_USER = gql`
    mutation($input: PinUserInput!){
        pinUser(input: $input)
    }
`;

const StyledLink = styled(Link)`
    text-decoration: none;
    color:black;

    &:focus, &:hover, &:visited, &:link, &:active {
        text-decoration: none;
    }
`;

const ProfilePhotoContainer = styled.div`
    display:flex;
    justify-content:center;
    height:100px;
    width:75%;
    padding-left:30px;
`;



const StatusCard = props => {
    const [username, setUsername] = useState('')

    if(props.data.user_id){
        getUsername(props.data.user_id, setUsername)
    }

    if(props.data.text || props.data.photo || props.data.video || props.data.audio){
        return (
                    <>
                        <Status>
                            <StyledLink to={`/user/${username}`} style={{width:"45%"}}>
                                <div>
                                    <p>{props.data.text}</p>
                                </div>
                            </StyledLink>
                            <StyledLink to={`/user/${username}`} style={{width:"45%"}}>
                                <div>
                                    <img style={{width:"100px", height:"40px"}} alt="status-media" src={props.data.photo}/>
                                </div>
                            </StyledLink>
                        </Status>
                    </>
                )
    }else if(props.data.username){
        return  (
                    <>
                        <Status>
                            <StyledLink to={`/user/${props.data.username}`} style={{width:"45%"}}>
                                <div>
                                    <p>{props.data.username}</p>
                                    <ProfilePhotoContainer>
                                        <img alt="profile" src={props.data.profile_photo} style={{width:'100px'}}/>
                                    </ProfilePhotoContainer>
                                </div>
                            </StyledLink>
                            <div style={{width:"45%"}}>
                                <Button variant="contained" color="primary" onClick={() => pinUser(props.id, props.data.id, props.data.username)}>Pin User</Button>
                            </div>
                        </Status>
                    </>
                )
    }else{
        return null;
    }
}


const getUsername = async (id, setUsername) => {
    const client = new ApolloClient({
        uri: process.env.REACT_APP_DEV_URL
    })

   await client.query({
        query: GET_USER,
        variables: {
            userId: id
        }
    }).then(res => setUsername(res.data.getUserById.username))
}

const pinUser = async (feed_id, user_id, username) => {
    const pin = {feed_id, user_id: user_id, username: username}

    const client = new ApolloClient({
        uri: process.env.REACT_APP_DEV_URL
    })

    await client.mutate({
        mutation: PIN_USER,
        variables: {
            input: pin
        }
    }).then(res => console.log(res))
}

export default StatusCard;