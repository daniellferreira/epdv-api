import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import {
  UserStatusCodes,
  InternalStatusCodes,
  ErrorCause,
  InternalError,
  UserError,
} from '@src/util/errors'

interface ErrorResponse {
  cause?: ErrorCause
  status: UserStatusCodes | InternalStatusCodes
  message: string
}

const validationError: ErrorResponse = {
  cause: 'VALIDATION_ERROR',
  message: 'There are validation errors',
  status: UserStatusCodes.Semantic,
}
const detailErrorByType = new Map<string, ErrorResponse>(
  Object.entries({
    internal: {
      message: 'Internal Error. Something went wrong!',
      status: InternalStatusCodes.InternalServerError,
    },
    ValidationError: validationError,
    MongoError: validationError,
    CastError: {
      cause: 'RECORD_NOTFOUND',
      message: '',
      status: UserStatusCodes.NotFound,
    },
  })
)

const detailFieldErrorByKind = new Map<string, string>(
  Object.entries({
    '': 'Invalid kind of error',
    required: 'Required field',
    unique: 'There is already a record with the same value',
  })
)

class HandlerError extends InternalError {
  keyPattern: any
}

export const ErrorHandler = (
  err: HandlerError,
  _: Request,
  res: Response,
  next: NextFunction
): void => {
  const error: ErrorResponse =
    detailErrorByType.get(err.name) ||
    (detailErrorByType.get('internal') as ErrorResponse)

  if (err instanceof UserError) {
    if (err.statusCode) {
      error.status = err.statusCode
    }

    if (err.message) {
      error.message = err.message
    }

    if (err.cause) {
      error.cause = err.cause
    }
  }

  const { status, cause } = error
  let { message } = error

  const details = new Map<string, string>()
  if (err instanceof mongoose.Error.ValidationError && err.errors) {
    Object.keys(err.errors).forEach((fieldName) => {
      const errorKind: string = err.errors[fieldName]?.kind || ''
      details.set(fieldName, detailFieldErrorByKind.get(errorKind) as string)
    })
  }
  if (err instanceof mongoose.mongo.MongoError && err.keyPattern) {
    const errorCode = parseInt(err.code as string, 10)
    const errorKind = [11000, 11001].includes(errorCode) ? 'unique' : ''
    const errorMessage = detailFieldErrorByKind.get(errorKind) as string

    Object.keys(err.keyPattern).forEach((fieldName) => {
      details.set(fieldName, errorMessage)
    })
  }
  if (err instanceof mongoose.Error.CastError) {
    message = `Record not found with ${err.path.replace('_', '')}: ${err.value}`
  }

  res.status(status).json({
    message,
    cause,
    errors: details.size > 0 ? Object.fromEntries(details) : undefined,
    original: process.env.NODE_ENV === 'dev' ? err : undefined,
  })
}
