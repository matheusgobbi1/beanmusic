# Fluxo de Campanhas - Bean Music

Este documento descreve o fluxo de criação de campanhas para promoção de músicas no Bean Music.

## Visão Geral

O fluxo de campanhas permite aos usuários criar campanhas para promover suas músicas em diferentes plataformas (Spotify, YouTube, TikTok, Instagram). O fluxo consiste em várias etapas que guiam o usuário desde a seleção da música até a finalização do pagamento.

## Estrutura do Fluxo

O fluxo de campanhas é dividido em 5 etapas principais, mais uma etapa de pagamento:

1. **Busca de Música**: O usuário busca e seleciona a música que deseja promover
2. **Informações**: Apresenta informações sobre como funciona a campanha
3. **Configuração**: Permite configurar o público-alvo (gênero, idioma, mood, observações)
4. **Orçamento**: Definição do valor a ser investido na campanha
5. **Resumo**: Exibe um resumo da campanha antes do pagamento
6. **Pagamento**: Permite ao usuário finalizar a compra da campanha

## Estrutura de Arquivos

```
src/
  ├── components/
  │   ├── campanhas/
  │   │   ├── BuscarMusica.tsx          # Componente de busca de músicas
  │   │   ├── CampanhaLayout.tsx        # Layout base para todas as telas do fluxo
  │   │   ├── ConfigurarCampanha.tsx    # Componente de configuração de segmentação
  │   │   ├── InfoCampanha.tsx          # Componente de informações
  │   │   ├── OrcamentoCampanha.tsx     # Componente de definição de orçamento
  │   │   ├── ResumoCampanha.tsx        # Componente de resumo da campanha
  │   │   └── index.ts                  # Exporta os componentes
  │   └── common/
  │       └── PaymentScreen.tsx         # Componente reutilizável de pagamento
  ├── contexts/
  │   └── CampanhaContext.tsx           # Contexto para gerenciar o estado da campanha
  └── services/
      └── spotifyApi.ts                 # Serviço para integração com a API do Spotify
```

```
app/
  └── (campanhas)/                      # Grupo de rotas para campanhas
      ├── _layout.tsx                   # Layout para o grupo de campanhas
      ├── pagamento.tsx                 # Tela de pagamento
      └── spotify/                      # Subgrupo para campanhas do Spotify
          ├── index.tsx                 # Tela inicial (busca de música)
          ├── info.tsx                  # Tela de informações
          ├── configurar.tsx            # Tela de configuração
          ├── orcamento.tsx             # Tela de orçamento
          └── resumo.tsx                # Tela de resumo
```

## Contexto da Campanha

O estado da campanha é gerenciado através do `CampanhaContext`, que contém:

- Etapa atual
- Plataforma selecionada (Spotify, YouTube, etc.)
- Música/faixa selecionada
- Opções de segmentação (gênero, idioma, mood)
- Orçamento definido
- Observações adicionais

## Como Usar

1. Na tela de campanhas, o usuário clica no botão flutuante e seleciona a plataforma desejada
2. O fluxo guia o usuário por cada uma das etapas mencionadas acima
3. Ao final do fluxo, o usuário é levado para a tela de pagamento
4. Após o pagamento, o usuário é redirecionado para a tela inicial

## Ampliação para Outras Plataformas

O sistema foi projetado para suportar facilmente a adição de novas plataformas. Para adicionar uma nova plataforma:

1. Adicione a nova plataforma ao tipo `PlatformType` no `CampanhaContext`
2. Crie uma nova pasta para a plataforma em `app/(campanhas)/`
3. Implemente os componentes específicos da plataforma, se necessário
4. Atualize o `FloatingActionButton` para incluir a nova opção

## Tela de Pagamento

A tela de pagamento é um componente reutilizável que pode ser usado em diferentes fluxos do aplicativo. Ele suporta:

- Pagamento por cartão de crédito
- Pagamento via PIX
- Pagamento via boleto bancário
