import { handleGroqGenerate } from '../_lib/handlers.ts';

export default async function handler(req: any, res: any) {
  return handleGroqGenerate(req, res);
}
