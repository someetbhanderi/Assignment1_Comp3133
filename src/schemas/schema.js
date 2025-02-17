const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFloat,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");
const User = require("../models/User");
const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// User Type
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    created_at: { type: GraphQLString },
  }),
});

// Employee Type
const EmployeeType = new GraphQLObjectType({
  name: "Employee",
  fields: () => ({
    id: { type: GraphQLID },
    first_name: { type: GraphQLString },
    last_name: { type: GraphQLString },
    email: { type: GraphQLString },
    gender: { type: GraphQLString },
    designation: { type: GraphQLString },
    salary: { type: GraphQLFloat },
    date_of_joining: { type: GraphQLString },
    department: { type: GraphQLString },
    employee_photo: { type: GraphQLString },
    created_at: { type: GraphQLString },
  }),
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    // Login User
    login: {
      type: UserType,
      args: {
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        const user = await User.findOne({ email: args.email });
        if (!user) throw new Error("User not found");

        const isMatch = await bcrypt.compare(args.password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        return user;
      },
    },

    // Get All Employees
    employees: {
      type: new GraphQLList(EmployeeType),
      async resolve() {
        return await Employee.find();
      },
    },

    // Get Employee by ID
    employee: {
      type: EmployeeType,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args) {
        return await Employee.findById(args.id);
      },
    },

    // Search Employees by Designation or Department
    searchEmployees: {
      type: new GraphQLList(EmployeeType),
      args: {
        designation: { type: GraphQLString },
        department: { type: GraphQLString },
      },
      async resolve(parent, args) {
        let query = {};
        if (args.designation) query.designation = args.designation;
        if (args.department) query.department = args.department;

        return await Employee.find(query);
      },
    },
  },
});

// Mutations
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // User Signup
    signup: {
      type: UserType,
      args: {
        username: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        const existingUser = await User.findOne({ email: args.email });
        if (existingUser) throw new Error("Email already in use");

        const user = new User({
          username: args.username,
          email: args.email,
          password: args.password,
        });

        await user.save();
        return user;
      },
    },

    // Add New Employee
    addEmployee: {
      type: EmployeeType,
      args: {
        first_name: { type: GraphQLNonNull(GraphQLString) },
        last_name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        gender: { type: GraphQLNonNull(GraphQLString) },
        designation: { type: GraphQLNonNull(GraphQLString) },
        salary: { type: GraphQLNonNull(GraphQLFloat) },
        date_of_joining: { type: GraphQLNonNull(GraphQLString) },
        department: { type: GraphQLNonNull(GraphQLString) },
        employee_photo: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const employee = new Employee(args);
        return await employee.save();
      },
    },

    // Update Employee by ID
    updateEmployee: {
      type: EmployeeType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        first_name: { type: GraphQLString },
        last_name: { type: GraphQLString },
        email: { type: GraphQLString },
        gender: { type: GraphQLString },
        designation: { type: GraphQLString },
        salary: { type: GraphQLFloat },
        date_of_joining: { type: GraphQLString },
        department: { type: GraphQLString },
        employee_photo: { type: GraphQLString },
      },
      async resolve(parent, args) {
        return await Employee.findByIdAndUpdate(args.id, args, { new: true });
      },
    },

    // Delete Employee by ID
    deleteEmployee: {
      type: EmployeeType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      async resolve(parent, args) {
        return await Employee.findByIdAndDelete(args.id);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
