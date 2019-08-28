import React from 'react';
import styled from "styled-components";
import Dropzone from 'react-dropzone';
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import axios from "axios";
import moment from "moment";
import ApolloClient from 'apollo-boost';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const UploadForm = styled.div`
    display:flex;
    justify-content:center;
    flex-direction:column;
    align-items: center;
    padding:20px;
    height:50%;
    width:75%;
    background:red;
`;

const currentUserId = gql`
    {
        getCurrentUser{
            id
        }
    }
`;

class Upload extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            user_id: "",
            text: "",
            photo: "",
            video: "",
            audio: ""
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
            this.setState({
                user_id: response.data.getCurrentUser.id
            })
        })
    }

    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onDrop = async file => {

        console.log(this.state.user_id)
        const fileType = file[0].type;
        console.log(fileType.toString())

        switch(fileType.toString()){
            case "image/jpeg":
                this.setState({
                    photo: file[0]
                })
                break;
            case "image/png":
                this.setState({
                    photo: file[0]
                })
                break;
            case "audio/mp3":
                this.setState({
                    audio: file[0]
                })
                break;
            case "video/mp4":
                this.setState({
                    video: file[0]
                })
                break;
            default:
                console.log("testing switch")
        }
    }

    uploadToS3 = async (file, signedRequest) => {
        const options = {
          headers: {
            "Content-Type": file.type
          }
        };
        await axios.put(signedRequest, file, options);
    };

    formatFilename = filename => {
        console.log(filename)
        const date = moment().format("YYYYMMDD");
        const randomString = Math.random()
          .toString(36)
          .substring(2, 7);
        const cleanFileName = filename.toString().toLowerCase().replace(/[^a-z0-9]/g, "-");
        switch(filename.type){
            case "image/jpeg":
                const newJpegFilename = `images/${date}-${randomString}-${cleanFileName}`;
                return newJpegFilename.substring(0, 60);
            case "image/png":
                const newPngFilename = `images/${date}-${randomString}-${cleanFileName}`;
                return newPngFilename.substring(0, 60);
            case "audio/mp3":
                const newMp3Filename = `audio/${date}-${randomString}-${cleanFileName}`;
                return newMp3Filename.substring(0, 60);
            case "video/mp4":
                const newMp4Filename = `video/${date}-${randomString}-${cleanFileName}`;
                return newMp4Filename.substring(0, 60);
            default:
                console.log("testing switch")
        }
    };


    bundleStatus = async e => {
        e.preventDefault()
        const { photo, audio, video } = this.state;

        console.log("test", photo, audio, video)

        const statusType = {
            photo,
            audio,
            video
        }

        const keys = Object.keys(statusType);

        const checkStatus = keys.filter(function(key) {
            return statusType[key]
        });

        const state = checkStatus[0];
        console.log(state)

        const client = new ApolloClient({
            uri: process.env.REACT_APP_DEV_URL
        })

        console.log(state)
        await client.mutate({
            mutation: s3Sign,
            variables: {
                filename: this.formatFilename(photo || audio || video),
                filetype: (photo.type || audio.type || video.type)
            }
        }).then( response => {
            console.log(response)
            const { signedRequest, url } = response.data.signS3;
            console.log(url)

            if(photo){
                this.setState({
                    photo: url
                })

                this.uploadToS3(photo, signedRequest)
            }else if(audio){
                this.setState({
                    audio: url
                })

                this.uploadToS3(audio, signedRequest)
            }else{
                this.setState({
                    video: url
                })

                this.uploadToS3(video, signedRequest)
            }
        }).catch( err => console.log(err))

        const file = () => {
            if(this.state.photo || this.state.video || this.state.audio){
                return (this.state.photo || this.state.video || this.state.audio)
            }else{
                return null
            }
        }

        await client.mutate({
            mutation: newStatus,
            variables: {
                input: {
                    user_id: parseInt(this.state.user_id),
                    text: this.state.text,
                    [state]: file
                }
            }
        }).then( response => {
            console.log(response)
        })

    };

    render(){
        return(
            <UploadForm>
                <h2>New Drop!</h2>
                <form onSubmit={this.bundleStatus}>
                    <TextField
                        id="text"
                        name="text"
                        value={this.state.text}
                        margin="dense"
                        onChange={this.handleChange}
                    />
                    <Dropzone onDrop={this.onDrop}>
                        {({getRootProps, getInputProps}) => (
                        <section className="container">
                            <div {...getRootProps({className: 'dropzone'})}>
                            <input {...getInputProps()} />
                            <p>Upload profile photo</p>
                            </div>
                        </section>
                        )}
                    </Dropzone>
                    <Button variant="contained" color="primary" type="submit">
                        Upload
                    </Button>
                </form>
            </UploadForm>
        )
    }
}

const newStatus = gql`
    mutation($input: StatusInput!){
        newStatus(input: $input){
            id
        }
    }
`;

const s3Sign = gql`
    mutation($filename: String!, $filetype: String!){
        signS3(filename: $filename, filetype: $filetype){
            signedRequest
            url
        }
    }
`;

export default graphql(s3Sign)(Upload);