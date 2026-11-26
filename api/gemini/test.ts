import { handleGeminiTest } from '../_lib/handlers.ts';

export default async function handler(req: any, res: any) {
  return handleGeminiTest(req, res);
}
