const fs = require('fs');
const path = require('path');

// Lista de arquivos que precisam ser atualizados
const filesToUpdate = [
  'src/components/modals/CreateAlunoModal.tsx',
  'src/components/AlunoFilter.tsx',
  'src/layout/TurmaList.tsx',
  'src/layout/SchoolList.tsx',
  'src/layout/PaginatedList.tsx',
  'src/layout/AlunoList.tsx',
  'src/components/modals/ImportAlunosModal .tsx',
  'src/components/modals/EditQuestaoModal.tsx',
  'src/components/modals/CreateUserModal.tsx',
  'src/components/modals/CreateQuestoesModal.tsx',
  'src/components/SelecaoEscolaSerieProva.tsx',
  'src/pages/TurmasPage.tsx',
  'src/components/selects/SelectRegiao.tsx',
  'src/components/selects/SelectProvas.tsx',
  'src/components/modals/CreateTurmaModal.tsx',
  'src/components/modals/CreateSchoolModal.tsx',
  'src/components/SchoolFilter.tsx',
  'src/components/RankingAlunos.tsx',
  'src/components/GraficoRankingRegioes.tsx',
  'src/components/GraficoDesempenhoAvaliacoes.tsx',
  'src/components/GraficoComponentesCurriculares.tsx'
];

// Função para atualizar um arquivo
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Adicionar import do useApi se não existir
    if (!content.includes('import { useApi } from') && content.includes('fetch(')) {
      const importMatch = content.match(/import.*from.*["']react["']/);
      if (importMatch) {
        content = content.replace(
          importMatch[0],
          importMatch[0] + '\nimport { useApi } from "../utils/api";'
        );
        modified = true;
      }
    }

    // Substituir chamadas fetch por api calls
    const fetchPattern = /fetch\(`\${window\.__ENV__\?\.API_URL\s*\?\?\s*import\.meta\.env\.VITE_API_URL\s*}\/([^`]+)`\)/g;
    content = content.replace(fetchPattern, (match, endpoint) => {
      modified = true;
      return `api.get(\`/${endpoint}\`)`;
    });

    // Adicionar const api = useApi(); se não existir
    if (content.includes('api.get(') && !content.includes('const api = useApi()')) {
      const componentMatch = content.match(/export\s+const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{/);
      if (componentMatch) {
        const insertPoint = componentMatch.index + componentMatch[0].length;
        content = content.slice(0, insertPoint) + '\n  const api = useApi();' + content.slice(insertPoint);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Atualizado: ${filePath}`);
    } else {
      console.log(`⏭️  Nenhuma mudança necessária: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

// Executar atualizações
console.log('🚀 Iniciando atualização das chamadas de API...\n');

filesToUpdate.forEach(file => {
  updateFile(file);
});

console.log('\n✨ Atualização concluída!');
