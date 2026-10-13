function lerInteiro(valor, padrao) {
  const numero = parseInt(valor, 10);
  return Number.isInteger(numero) && numero > 0 ? numero : padrao;
}

async function paginar(modelo, opcoes, query, porPagina) {
  const total = await modelo.count({ where: opcoes.where });
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const pagina = Math.min(lerInteiro(query.pagina, 1), totalPaginas);

  const itens = await modelo.findAll({
    ...opcoes,
    limit: porPagina,
    offset: (pagina - 1) * porPagina
  });

  return { itens, pagina, totalPaginas, total };
}

module.exports = { lerInteiro, paginar };
