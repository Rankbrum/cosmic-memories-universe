# Exploração por constelações

## Objetivo
Transformar as constelações já cadastradas em capítulos navegáveis do universo, mantendo cada estrela como uma memória.

## Experiência
- Adicionar um seletor discreto de constelações sobre a galáxia, com nome e quantidade de memórias.
- Ao escolher uma constelação, destacar somente suas estrelas e aproximar a câmera do grupo.
- Exibir o nome do capítulo ativo e permitir voltar à visão de todas as constelações.
- Manter a abertura normal de cada estrela e a navegação para a linha do tempo.
- No celular, usar uma faixa horizontal acessível por toque, sem bloquear os gestos da galáxia.
- Constelações ainda vazias aparecem como capítulos futuros, sem tentar focar a câmera.

## Detalhes técnicos
- Derivar os grupos a partir de `category_id`, usando as categorias e memórias já existentes.
- Ampliar o layout 3D para fornecer o centro de cada constelação e conduzir a câmera até ele.
- Atenuar estrelas e linhas fora do capítulo selecionado, preservando a posição estável de todas as memórias.
- Criar controles com estados de foco, rótulos acessíveis e respeito a movimento reduzido.
- Não alterar banco, fotos ou dados cadastrados.

## Validação
- Conferir seleção, retorno à visão geral e abertura de memória em desktop e celular.
- Confirmar que capítulos vazios e memórias sem categoria não quebram a experiência.
- Verificar erros da prévia após a implementação.
