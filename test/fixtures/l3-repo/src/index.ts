import pino from 'pino';

const logger = pino({ level: 'info' });

export function hello(name: string): string {
  logger.info({ name }, 'Greeting user');
  return `Hello, ${name}!`;
}
