# Guia de Contribuição

## Padrões de Código

### Backend (TypeScript/Node.js)

- Use TypeScript strict mode
- Siga convenções de nomenclatura:
  - Controllers: `nomeController.ts`
  - Services: `nomeService.ts`
  - Validators: `nomeValidator.ts`
- Documente funções com JSDoc
- Use async/await ao invés de callbacks

### Frontend (React/TypeScript)

- Componentes funcionais com hooks
- Use TypeScript para props
- Nomenclatura: PascalCase para componentes
- CSS-in-JS com Material-UI
- Validação com Yup

### Banco de Dados

- Migrations via Prisma
- Não edite migrations após commit
- Use seed.ts para dados iniciais

## Git Workflow

### Branches

- `main`: Código de produção
- `develop`: Código em desenvolvimento
- `feature/nome`: Novas funcionalidades
- `fix/nome`: Correções de bugs

### Commits

Use mensagens descritivas:

```
feat: adiciona exportação de relatórios em PDF
fix: corrige cálculo de OEE no dashboard
docs: atualiza documentação da API
refactor: melhora performance do polling Modbus
```

### Pull Requests

1. Crie branch a partir de `develop`
2. Desenvolva a funcionalidade
3. Teste localmente
4. Abra PR com descrição clara
5. Aguarde revisão

## Testes

Execute testes antes de commitar:

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Documentação

- Atualize README.md se necessário
- Documente novas rotas da API
- Adicione comentários em código complexo

## Code Review

Ao revisar PRs, verifique:

- [ ] Código segue padrões
- [ ] Testes passam
- [ ] Documentação atualizada
- [ ] Sem código comentado
- [ ] Sem console.log desnecessários

## Versionamento

Seguimos Semantic Versioning (semver):

- MAJOR: Mudanças incompatíveis
- MINOR: Novas funcionalidades compatíveis
- PATCH: Correções de bugs

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.


