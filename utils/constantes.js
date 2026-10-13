const STATUS = ['pendente', 'andamento', 'concluida'];
const PRIORIDADES = ['baixa', 'media', 'alta'];

const ROTULOS_STATUS = {
  pendente: 'Pendente',
  andamento: 'Em andamento',
  concluida: 'Concluída'
};

const ROTULOS_PRIORIDADE = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta'
};

module.exports = { STATUS, PRIORIDADES, ROTULOS_STATUS, ROTULOS_PRIORIDADE };
