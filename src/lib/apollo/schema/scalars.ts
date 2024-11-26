// src/lib/apollo/schema/scalars.ts

import gql from 'graphql-tag'
import {
  GraphQLScalarType,
  Kind,
  ValueNode,
  ObjectValueNode,
  ListValueNode,
} from 'graphql'

export const scalarTypeDefs = gql`
  scalar Date
  scalar JSON
`

function parseJSONLiteral(ast: ValueNode): any {
  switch (ast.kind) {
    case Kind.STRING:
      return ast.value
    case Kind.BOOLEAN:
      return ast.value
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value)
    case Kind.OBJECT: {
      const obj: Record<string, any> = {}
      const objectAst = ast as ObjectValueNode
      for (const field of objectAst.fields) {
        obj[field.name.value] = parseJSONLiteral(field.value)
      }
      return obj
    }
    case Kind.LIST: {
      const listAst = ast as ListValueNode
      return listAst.values.map(parseJSONLiteral)
    }
    default:
      return null
  }
}

export const scalarResolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value: any) {
      return value instanceof Date ? value.getTime() : null
    },
    parseValue(value: any) {
      return new Date(value)
    },
    parseLiteral(ast: ValueNode) {
      if (ast.kind === Kind.INT) {
        return new Date(parseInt(ast.value, 10))
      }
      return null
    },
  }),

  JSON: new GraphQLScalarType({
    name: 'JSON',
    description: 'JSON custom scalar type',
    serialize(value: any) {
      return value
    },
    parseValue(value: any) {
      return value
    },
    parseLiteral: parseJSONLiteral,
  }),
}
