# Sistema de Logos Dinâmicas por Município

## 🎯 Funcionalidade

O sistema detecta automaticamente o município baseado na variável de ambiente `APP_NAME` e exibe a logo correspondente na tela de login, com fallback robusto para garantir que o site nunca quebre.

## 🔧 Como Funciona

### 1. Detecção Automática
- Extrai o município do `APP_NAME` (ex: "SAG (Ribamar)" → "Ribamar")
- Fallback para "Ribamar" se não conseguir detectar

### 2. Sistema de Fallback Robusto
- **Primeiro:** Tenta carregar a logo específica do município
- **Se falhar:** Automaticamente usa `/sag.svg` como fallback
- **Loading:** Mostra spinner enquanto carrega
- **Erro:** Logs de warning no console, mas nunca quebra o site

### 3. Componente `DynamicLogo`
- Tratamento de erro com `onError`
- Estado de loading com spinner
- Transição suave entre estados
- Altura/largura configuráveis

## 📁 Estrutura de Arquivos

```
src/
├── utils/municipalityLogo.ts     # Configurações dos municípios
├── components/DynamicLogo.tsx    # Componente de logo dinâmica
└── layout/LoginForm.tsx          # Login com logo dinâmica

public/
├── sag.svg                       # Logo padrão (fallback)
└── logos/
    ├── ribamar-logo.png          # Logo de Ribamar
    ├── sao-bento-logo.png        # Logo de São Bento
    ├── santa-rita-logo.png       # Logo de Santa Rita
    └── bacabeira-logo.png         # Logo de Bacabeira
```

## 🎨 Municípios Suportados

- **Ribamar** - Logo com elementos naturais e slogan "Cuidando da nossa gente"
- **São Bento** - Logo com brasão municipal
- **Santa Rita** - Logo da Prefeitura de Santa Rita
- **Bacabeira** - Logo da Prefeitura de Bacabeira

## ⚙️ Configuração

### Para Adicionar Novo Município:

1. **Configure a variável de ambiente:**
   ```bash
   APP_NAME="SAG (Nome do Município)"
   ```

2. **Adicione a configuração em `municipalityLogo.ts`:**
   ```typescript
   "Novo Município": {
     name: "Novo Município",
     logo: "/logos/novo-municipio-logo.png",
     fallbackLogo: "/sag.svg"
   }
   ```

3. **Crie o arquivo PNG em `public/logos/`:**
   ```bash
   public/logos/novo-municipio-logo.png
   ```
   
   **Recomendações para PNG:**
   - Resolução: 200x100px ou similar
   - Formato: PNG com transparência
   - Tamanho: Otimizado para web (< 100KB)

## 🛡️ Garantias de Segurança

- ✅ **Nunca quebra o site** - Sempre há fallback
- ✅ **Logs de erro** - Avisa sobre problemas no console
- ✅ **Loading state** - Feedback visual durante carregamento
- ✅ **Transições suaves** - UX profissional
- ✅ **Responsivo** - Funciona em qualquer tamanho

## 🚀 Como Usar

O sistema funciona automaticamente! Basta configurar o `APP_NAME` e a logo correta aparecerá no login.

```typescript
// Exemplo de uso no LoginForm
<DynamicLogo 
  className="mb-4"
  alt={`Logo de ${municipalityName}`}
  width={120}
  height={120}
/>
```

