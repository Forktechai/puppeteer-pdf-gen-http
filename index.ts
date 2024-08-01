require('source-map-support/register')
import serverlessExpress from '@codegenie/serverless-express'
import app from './app'

exports.handler = serverlessExpress({ app })