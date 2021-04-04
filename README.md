# e-PDV API (v1)

## Execução:

Para executar a API em modo de **desenvolvimento** você deve executar o seguinte comando:

_Linux:_
`npm run start:dev`

_Windows:_
`npm run start:dev-win`

## Documentação da API:

A documentação está disponível na rota inicial da aplicação, por padrão: _http://localhost:3000/_

Usamos o software [Insomnia](https://insomnia.rest/ 'Insomnia') como software de gestão e testes da API, é essencial que tenha ele instalado para realizar as atualizações na documentação.

##### Para importar documentação (possibilitando testes e edição):

1. Execute a aplicaçao e acesse a documentação na URL inicial.
2. Clique no botão "Run in Insomnia" e na página que abrirá novamente em "Run..."
3. No Insomnia confirme a importação.
4. O workspace foi importado e agora é possível realizar testes e atualizar a documentação.

##### Para exportar a documentação e atualizar no projeto:

1. No Insomnia clique no nome do worskpace "e-PDV API - v1"
2. Import/Export
3. Export Data
4. Current Document / Collection
5. Export -> Selecione o formato "Insomnia v4 (JSON)"
6. Done
7. Altere o nome do arquivo para insomnia.json
8. Localize a pasta do projeto e salve o arquivo em /src/docs, substituindo o arquivo existente.
9. Pronto, assim a documentação já está atualizada e pode ser visualizada na rota raiz da aplicação
