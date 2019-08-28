const { gql } = require("apollo-server");

module.exports = gql`
    union Result = User | Status

    type Query {
        #//*User
        getCurrentUser: User
        getUserBy(param: String!, value: String!): User
        getUserById(userId: ID!): User

        #//*Status
        allStatus(user_id: ID!): [Status!]

        #//*Search
        search(text: String!): [Result]
    }

    type Mutation {
        #//*User
        addUser(input: UserInput!): User!
        updateUser(id: ID!, input: UserInput!): User!
        deleteUser(id: ID!): Int!
        pinUser(input: PinUserInput!): Int!

        #//*AWS
        signS3(filename: String!, filetype: String!): S3Payload!

        #//*Status
        newStatus(input: StatusInput!): Status
        deleteStatus(id: ID!): Int!
    }

    scalar Date

    type User {
        id: ID!
        email: String!
        firstName: String!
        lastName: String!
        username: String!
        location: String!
        type: String!
        profile_photo: String
        status: [Status]
        pinned: [User]
    }

    type Status {
        id: ID!
        user_id: ID!
        text: String
        photo: String
        video: String
        audio: String
    }

    type S3Payload {
        signedRequest: String!,
        url: String!
    }

    input UserInput {
        email: String!
        firstName: String!
        lastName: String!
        username: String!
        location: String!
        type: String!
        profile_photo: String
    }

    input StatusInput {
        user_id: ID!
        text: String
        photo: String
        video: String
        audio: String
    }

    input PinUserInput {
        feed_id: ID!
        user_id: ID!
        username: String!
    }

`;