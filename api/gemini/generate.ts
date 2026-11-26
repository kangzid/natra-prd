import { handleGeminiGenerate } from '../_lib/handlers.ts';

export default async function handler(req: any, res: any) {
  return handleGeminiGenerate(req, res);
}
