
const CHAVES = {
  alunos: "escola_nova_alunos",
  professores: "escola_nova_professores",
  turmas: "escola_nova_turmas",
  matriculas: "escola_nova_matriculas"
};

const exemplos = {
  alunos: [
    {
      id: 1,
      nome: "Ana Oliveira",
      email: "ana@exemplo.com",
      turma: "9º ano A",
      status: "Ativo"
    },
    {
      id: 2,
      nome: "Lucas Santos",
      email: "lucas@exemplo.com",
      turma: "8º ano B",
      status: "Ativo"
    }
  ],
  professores: [
    {
      id: 1,
      nome: "Carla Mendes",
      email: "carla@exemplo.com",
      disciplina: "Matemática",
      telefone: "(83) 99999-1111"
    }
  ],
  turmas: [
    {
      id: 1,
      nome: "9º ano A",
      serie: "9º ano",
      turno: "Manhã",
      vagas: 30
    },
    {
      id: 2,
      nome: "8º ano B",
      serie: "8º ano",
      turno: "Tarde",
      vagas: 28
    }
  ],
  matriculas: [
    {
      id: 1,
      aluno: "Ana Oliveira",
      turma: "9º ano A",
      data: "2026-02-10",
      status: "Ativa"
    }
  ]
};

// Carrega os dados ou cria registros de demonstração.
function carregarDados(tipo) {
  try {
    const salvo = localStorage.getItem(CHAVES[tipo]);

    if (salvo !== null) {
      const dados = JSON.parse(salvo);
      if (Array.isArray(dados)) return dados;
    }
  } catch (erro) {
    console.warn("Não foi possível ler os dados:", erro);
  }

  const iniciais = exemplos[tipo].map(item => ({ ...item }));
  salvarDados(tipo, iniciais);
  return iniciais;
}

const dados = {
  alunos: carregarDados("alunos"),
  professores: carregarDados("professores"),
  turmas: carregarDados("turmas"),
  matriculas: carregarDados("matriculas")
};

function salvarDados(tipo, lista) {
  try {
    localStorage.setItem(CHAVES[tipo], JSON.stringify(lista));
    return true;
  } catch (erro) {
    alert("Não foi possível salvar os dados neste navegador.");
    console.error(erro);
    return false;
  }
}

// Protege o conteúdo digitado antes de colocá-lo no HTML.
function seguro(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[caractere]);
}

const titulos = {
  inicio: "Visão geral",
  alunos: "Alunos",
  professores: "Professores",
  turmas: "Turmas",
  matriculas: "Matrículas"
};

function abrirPagina(pagina) {
  document.querySelectorAll(".page").forEach(secao => {
    secao.classList.toggle("active", secao.id === pagina);
  });

  document.querySelectorAll(".nav-item").forEach(botao => {
    botao.classList.toggle("active", botao.dataset.page === pagina);
  });

  document.getElementById("page-title").textContent =
    titulos[pagina] || "Visão geral";
}

document.querySelectorAll("[data-page]").forEach(botao => {
  botao.addEventListener("click", () => {
    abrirPagina(botao.dataset.page);
  });
});

document.querySelectorAll("[data-go]").forEach(botao => {
  botao.addEventListener("click", () => {
    abrirPagina(botao.dataset.go);
  });
});

function statusHTML(status) {
  const pendente = /pendente/i.test(status);

  return `<span class="pill ${pendente ? "pending" : ""}">
    ${seguro(status)}
  </span>`;
}

function botaoExcluir(tipo, id) {
  return `<button class="btn-delete"
    data-delete="${tipo}" data-id="${id}">
    Excluir
  </button>`;
}

function linhasHTML(tipo, lista) {
  if (!lista.length) {
    const colunas = {
      alunos: 6,
      professores: 6,
      turmas: 6,
      matriculas: 6
    };

    return `<tr><td colspan="${colunas[tipo]}"
      class="empty-cell">Nenhum registro encontrado.</td></tr>`;
  }

  return lista.map(item => {
    let colunas = "";

    if (tipo === "alunos") {
      colunas = `
        <td>${item.id}</td>
        <td>${seguro(item.nome)}</td>
        <td>${seguro(item.email)}</td>
        <td>${seguro(item.turma)}</td>
        <td>${statusHTML(item.status)}</td>`;
    }

    if (tipo === "professores") {
      colunas = `
        <td>${item.id}</td>
        <td>${seguro(item.nome)}</td>
        <td>${seguro(item.email)}</td>
        <td>${seguro(item.disciplina)}</td>
        <td>${seguro(item.telefone || "—")}</td>`;
    }

    if (tipo === "turmas") {
      colunas = `
        <td>${item.id}</td>
        <td>${seguro(item.nome)}</td>
        <td>${seguro(item.serie)}</td>
        <td>${seguro(item.turno)}</td>
        <td>${seguro(item.vagas)}</td>`;
    }

    if (tipo === "matriculas") {
      colunas = `
        <td>${item.id}</td>
        <td>${seguro(item.aluno)}</td>
        <td>${seguro(item.turma)}</td>
        <td>${seguro(item.data)}</td>
        <td>${statusHTML(item.status)}</td>`;
    }

    return `<tr>
      ${colunas}
      <td>${botaoExcluir(tipo, item.id)}</td>
    </tr>`;
  }).join("");
}

function renderizarTabela(tipo) {
  const pesquisa = document.querySelector(
    `[data-search="${tipo}"]`
  );

  const termo = (pesquisa?.value || "").toLowerCase().trim();

  const filtrados = dados[tipo].filter(item =>
    Object.values(item).some(valor =>
      String(valor).toLowerCase().includes(termo)
    )
  );

  document.getElementById(`table-${tipo}`).innerHTML =
    linhasHTML(tipo, filtrados);
}

function renderizarInicio() {
  document.getElementById("total-alunos").textContent =
    dados.alunos.length;

  document.getElementById("total-professores").textContent =
    dados.professores.length;

  document.getElementById("total-turmas").textContent =
    dados.turmas.length;

  document.getElementById("total-matriculas").textContent =
    dados.matriculas.length;

  const recentes = [...dados.alunos]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const corpo = document.getElementById("recent-students");

  if (!recentes.length) {
    corpo.innerHTML = `
      <tr><td colspan="4" class="empty-cell">
        Nenhum aluno cadastrado.
      </td></tr>`;
    return;
  }

  corpo.innerHTML = recentes.map(aluno => `
    <tr>
      <td>${seguro(aluno.nome)}</td>
      <td>${seguro(aluno.email)}</td>
      <td>${seguro(aluno.turma)}</td>
      <td>${statusHTML(aluno.status)}</td>
    </tr>
  `).join("");
}

function atualizarTudo() {
  ["alunos", "professores", "turmas", "matriculas"]
    .forEach(renderizarTabela);

  renderizarInicio();
}

// Cadastro dos quatro tipos de registros.
const campos = {
  alunos: ["nome", "email", "turma", "status"],
  professores: ["nome", "email", "disciplina", "telefone"],
  turmas: ["nome", "serie", "turno", "vagas"],
  matriculas: ["aluno", "turma", "data", "status"]
};

Object.keys(campos).forEach(tipo => {
  const formulario = document.getElementById(`form-${tipo}`);

  formulario.addEventListener("submit", evento => {
    evento.preventDefault();

    const formularioDados = new FormData(formulario);
    const registro = {};

    campos[tipo].forEach(campo => {
      registro[campo] = String(
        formularioDados.get(campo) ?? ""
      ).trim();
    });

    const vazio = campos[tipo].some(campo =>
      formulario.elements[campo].required &&
      !registro[campo]
    );

    if (vazio) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (tipo === "turmas" &&
        (!Number.isInteger(Number(registro.vagas)) ||
         Number(registro.vagas) < 1)) {
      alert("Informe uma quantidade de vagas válida.");
      return;
    }

    if (tipo === "alunos" &&
        dados.alunos.some(item =>
          item.email.toLowerCase() === registro.email.toLowerCase()
        )) {
      alert("Já existe um aluno com esse e-mail.");
      return;
    }

    registro.id = Math.max(
      0, ...dados[tipo].map(item => Number(item.id) || 0)
    ) + 1;

    if (tipo === "turmas") {
      registro.vagas = Number(registro.vagas);
    }

    dados[tipo].push(registro);

    if (!salvarDados(tipo, dados[tipo])) {
      dados[tipo].pop();
      return;
    }

    formulario.reset();
    atualizarTudo();

    alert("Cadastro realizado com sucesso!");
  });
});

// Pesquisa nas tabelas.
document.querySelectorAll("[data-search]").forEach(campo => {
  campo.addEventListener("input", () => {
    renderizarTabela(campo.dataset.search);
  });
});

// Exclui um registro quando o botão correspondente é clicado.
document.addEventListener("click", evento => {
  const botao = evento.target.closest("[data-delete]");
  if (!botao) return;

  const tipo = botao.dataset.delete;
  const id = Number(botao.dataset.id);

  if (!CHAVES[tipo]) return;

  const registro = dados[tipo].find(item => item.id === id);
  if (!registro) return;

  if (!confirm(`Deseja excluir o registro "${registro.nome ||
    registro.aluno || registro.id}"?`)) {
    return;
  }

  const anteriores = [...dados[tipo]];
  dados[tipo] = dados[tipo].filter(item => item.id !== id);

  if (!salvarDados(tipo, dados[tipo])) {
    dados[tipo] = anteriores;
    return;
  }

  atualizarTudo();
});

atualizarTudo();
abrirPagina("inicio");