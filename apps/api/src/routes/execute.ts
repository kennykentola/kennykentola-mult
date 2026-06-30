import { Router } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// https://emkc.org/api/v2/piston/execute
const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

router.post('/execute-code', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { language, sourceCode } = req.body;

  if (!language || !sourceCode) {
    return res.status(400).json({ error: 'Language and source code are required.' });
  }

  // Map common languages to Piston language identifiers and versions
  const languageMap: Record<string, { language: string, version: string }> = {
    'javascript': { language: 'javascript', version: '18.15.0' },
    'typescript': { language: 'typescript', version: '5.0.3' },
    'python': { language: 'python', version: '3.10.0' },
    'java': { language: 'java', version: '15.0.2' },
    'c': { language: 'c', version: '10.2.0' },
    'cpp': { language: 'c++', version: '10.2.0' },
    'php': { language: 'php', version: '8.2.3' },
  };

  const selectedLanguage = languageMap[language.toLowerCase()];

  if (!selectedLanguage) {
    return res.status(400).json({ error: `Language ${language} is not supported.` });
  }

  try {
    const response = await fetch(PISTON_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: selectedLanguage.language,
        version: selectedLanguage.version,
        files: [
          {
            content: sourceCode
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Code Execution] Piston error:', errorText);
      return res.status(500).json({ error: 'Failed to execute code.' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('[Code Execution] Exception:', error.message);
    return res.status(500).json({ error: 'An error occurred while executing code.' });
  }
});

export default router;
