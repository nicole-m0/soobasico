# Ilustrações de demonstração

SVGs originais criados localmente para o catálogo fictício da Só o Básico. Não são fotografias oficiais nem representam produtos reais. Não usam imagens externas, textos comerciais ou logos de terceiros.

- Manifesto: `src/lib/demo-illustrations.json` (slug, tipo de embalagem/objeto e cor).
- Gerador: `node scripts/create-catalog-illustrations.mjs`.
- Estilo: fundo claro, tons suaves, objeto centralizado, reflexos e sombras simples.
- As nove ilustrações anteriores em `public/images/products/` continuam preservadas e utilizadas quando adequadas.
- O seed completa imagens ausentes somente dos produtos de demonstração com id e slug conhecidos. Imagens próprias cadastradas posteriormente são preservadas. A única correção de uma imagem anterior é o sérum demonstrativo que usava o pote genérico `skincare.svg`.
- Produtos reais sem imagem continuam usando o placeholder da loja, sem associação automática com este manifesto.
