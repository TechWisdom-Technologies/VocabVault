/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components/stages');
const files = fs.readdirSync(dir).filter(f => f.startsWith('stage-') && f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // We need to inject RotateCcw into lucide-react imports if it doesn't exist
  if (!content.includes('RotateCcw') && content.includes('lucide-react')) {
    content = content.replace(/import \{([^}]+)\} from "lucide-react";/, (match, p1) => {
      return `import {${p1}, RotateCcw } from "lucide-react";`;
    });
  }

  // Look for the "Continue to Stage X" Button pattern
  // It's usually like:
  // <Button ...>
  //   Continue to Stage 3
  //   ...
  // </Button>
  
  // Actually, some are disabled based on condition.
  // Instead of complex regex, let's look for the final `<Button` that contains "onClick={handleComplete}"
  
  const handleCompleteBtnRegex = /(<Button[^>]*onClick={handleComplete}[^>]*>[\s\S]*?<\/Button>)/g;
  
  content = content.replace(handleCompleteBtnRegex, (match) => {
    // If it's already wrapped in a flex group, don't do it again
    if (content.includes('Repeat Stage') && content.includes('window.location.reload()')) return match;

    // We wrap it in a flex div
    return `
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto">
        <Button
          variant="outline"
          size="lg"
          onClick={() => window.location.reload()}
          className="tap-target px-8 rounded-full h-14 text-lg border-primary/20 hover:bg-primary/5 text-primary w-full sm:w-auto"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Repeat Stage
        </Button>
        ${match.replace('w-full', 'w-full sm:w-auto')}
      </div>
    `;
  });

  fs.writeFileSync(filePath, content);
}
console.log('Done adding Repeat Stage buttons!');
