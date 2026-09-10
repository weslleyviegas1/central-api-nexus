# Central API Hub

## Objetivo
Transformar o protótipo e as referências enviadas em um painel interativo, fiel ao visual neon escuro no desktop e no celular.

## Implementação
- Criar o sistema visual global com fundo profundo, bordas azuis, cores de status, tipografia e efeitos de brilho coerentes.
- Construir a barra superior, navegação lateral, lista de SaaS, área central de conexões, indicadores e painel de detalhes.
- Tornar os aplicativos selecionáveis e arrastáveis na área central, com linhas de conexão atualizadas entre os cartões e a Central API Hub.
- Implementar ações visíveis: limpar painel, alternar conexões, selecionar aplicativos e abrir/fechar detalhes no celular.
- Adaptar a composição para celular seguindo a referência: navegação horizontal, mapa compacto, métricas e lista de SaaS abaixo.
- Adicionar metadados próprios da página e garantir acessibilidade básica em controles e estados.

## Verificação
- Conferir o resultado em desktop e celular no navegador.
- Validar interações principais, ausência de sobreposição e carregamento sem erros.

## Detalhes técnicos
- React com TanStack Start e Tailwind CSS v4.
- Ícones Lucide; sem incorporar as imagens de referência no produto.
- Estado local para seleção, posição e conexão dos aplicativos; nenhum serviço externo ou banco de dados nesta etapa.
