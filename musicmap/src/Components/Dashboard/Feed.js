import React, { useState, useEffect } from 'react';
import ApolloClient from 'apollo-boost';
import gql from "graphql-tag";
import styled from 'styled-components';
import StatusCard from '../Account/StatusCard';

const GET_CURRENT = gql`
    query{
        getCurrentUser{
            id
            pinned{
                username
                status{
                    text
                    photo
                    video
                    audio
                }
            }
        }
    }
`;

const StatusContainer = styled.div`
  display:flex;
  justify-content:center;
  flex-direction:column;
  align-items:center;
  flex-wrap:nowrap;
  width:100%;
`;


const Feed = () => {
    const [pinnedStatus, setPinnedStatus] = useState()

    useEffect(() => {
        getFeed(setPinnedStatus)
    }, [])

    if(pinnedStatus){
        console.log("status", pinnedStatus)
        return(
            <div className="feed">
                <StatusContainer>
                    {
                        pinnedStatus.map(results => {
                            return results.status.map(userStatus => {
                                return <StatusCard data={userStatus} />
                            })
                        })
                    }
                </StatusContainer>
            </div>
        )
    }else{
        return <div>Loading</div>
    }
}

const getFeed = async setPinnedStatus => {
    const idToken = localStorage.getItem("token");

    const client = new ApolloClient({
        uri: process.env.REACT_APP_DEV_URL,
        headers: {authorization: idToken}
    })

    await client.query({
        query: GET_CURRENT
    }).then(res => {
        console.log(res)
        setPinnedStatus(res.data.getCurrentUser.pinned)
    })
}

export default Feed;