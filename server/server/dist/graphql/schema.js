"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const schema_1 = require("@graphql-tools/schema");
const TypeDefs_1 = require("./TypeDefs");
const resolvers_1 = require("./resolvers");
exports.schema = (0, schema_1.makeExecutableSchema)({
    typeDefs: TypeDefs_1.typeDefs,
    resolvers: resolvers_1.resolvers,
});
