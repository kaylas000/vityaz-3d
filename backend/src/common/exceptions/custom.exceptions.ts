import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class InsufficientBalanceException extends HttpException {
  constructor(required: number, available: number) {
    super(
      `Insufficient balance. Required: ${required}, Available: ${available}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidTransactionException extends HttpException {
  constructor(reason: string) {
    super(`Invalid transaction: ${reason}`, HttpStatus.BAD_REQUEST);
  }
}

export class BattleNotFoundException extends HttpException {
  constructor(battleId: string) {
    super(`Battle with ID ${battleId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class DuplicateEntryException extends HttpException {
  constructor(field: string, value: string) {
    super(
      `${field} '${value}' already exists`,
      HttpStatus.CONFLICT,
    );
  }
}
