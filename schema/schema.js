//Circular linked Copany and User schemas

const graphql = require("graphql");
const axios = require("axios");
//Import graphql data types
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

//GraphQL Company schema
const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parentValue, args) {
        const res = await axios.get(
          `http://localhost:3000/companies/${parentValue.id}/users`
        );
        return res.data;
      }
    }
  })
});

//GraphQL User schema
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      async resolve(parentValue, args) {
        const res = await axios.get(
          `http://localhost:3000/companies/${parentValue.companyId}`
        );
        console.log(res.data);
        return res.data;
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, args) {
        const res = await axios.get(`http://localhost:3000/users/${args.id}`);
        return res.data;
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, args) {
        const res = await axios.get(
          `http://localhost:3000/companies/${args.id}`
        );
        return res.data;
      }
    }
  }
});

//Mutation schema Type
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      async resolve(parentValue, args) {
        const res = await axios.post(`http://localhost:3000/users`, {
          firstName: args.firstName,
          age: args.age
        });
        return res.data;
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parentValue, args) {
        const res = await axios.delete(
          `http://localhost:3000/users/${args.id}`
        );
        return res.data;
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      async resolve(parentValue, args) {
        const res = await axios.patch(
          `http://localhost:3000/users/${args.id}`,
          args
        );
        return res.data;
      }
    }
  }
});

//Merge RootQuery and UserType
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutation
});
