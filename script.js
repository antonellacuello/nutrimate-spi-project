$(document).ready(() => {   //garante que o código dentro dela será executado apenas quando o HTML estiver completamente carregado
  //função para obter o dia da semana atual em português
  function getDiaAtual() {
    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const hoje = new Date().getDay();
    return dias[hoje];
  }

  //função para obter o próximo dia disponível na tabela
  function getProximoDiaDisponivel() {
    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const diaAtual = new Date().getDay();
    const linhas = $(".tabela-semana tr");
    let ultimoDiaIndex = -1;

    //encontra o último dia preenchido na tabela
    for (let i = 2; i < linhas.length; i++) {
      const colunas = $(linhas[i]).find("td");
      if ($(colunas[1]).text().trim() !== "") {
        ultimoDiaIndex = dias.indexOf($(colunas[0]).text());
      }
    }

    //se não houver dias preenchidos, começa do dia atual
    if (ultimoDiaIndex === -1) {
      return dias[diaAtual];
    }

    //caso contrário, retorna o próximo dia após o último preenchido
    return dias[(ultimoDiaIndex + 1) % 7];
  }

  //função para calcular os nutrientes com base na quantidade ingerida
  function calcularNutrientes() {
    //objeto com os dados nutricionais de 100g (retirado do csv)
    const alimentos = {
      arroz: { carboidratos: 28.2, proteinas: 2.7, gorduras: 0.3, fibras: 0.4, acucares: 0.1, sodio: 0.001, potassio: 0.035, calcio: 0.01 },
      feijao: { carboidratos: 20, proteinas: 9, gorduras: 0.5, fibras: 1.3, acucares: 1, sodio: 0.002, potassio: 1.5, calcio: 0.05 },
      pao: { carboidratos: 50, proteinas: 9, gorduras: 2.5, fibras: 2.5, acucares: 2.5, sodio: 0.47, potassio: 0.12, calcio: 0.02 },
      laranja: { carboidratos: 11.75, proteinas: 0.94, gorduras: 0.12, fibras: 1.8, acucares: 9.35, sodio: 0.001, potassio: 0.18, calcio: 0.04 },
      "carne-bovina": { carboidratos: 0, proteinas: 26, gorduras: 20, fibras: 0, acucares: 0, sodio: 0.065, potassio: 0.35, calcio: 0.015 },
      "carne-frango": { carboidratos: 0, proteinas: 31, gorduras: 3.6, fibras: 0, acucares: 0, sodio: 0.07, potassio: 0.3, calcio: 0.012 },
      ovo: { carboidratos: 0.72, proteinas: 13, gorduras: 10, fibras: 0, acucares: 0, sodio: 0.12, potassio: 0.126, calcio: 0.056 },
      cafe: { carboidratos: 0, proteinas: 0, gorduras: 0, fibras: 0, acucares: 0, sodio: 0.005, potassio: 0.09, calcio: 0 },
      banana: { carboidratos: 22.84, proteinas: 1.09, gorduras: 0.33, fibras: 2.6, acucares: 12.23, sodio: 0.001, potassio: 0.36, calcio: 0.005 },
      batata: { carboidratos: 17.58, proteinas: 2.02, gorduras: 0.1, fibras: 2.2, acucares: 1.25, sodio: 0.006, potassio: 0.425, calcio: 0.01 },
    };

    //inicializa os dados para o gráfico
    const alimentosSelecionados = [];
    const nutrientesTotais = {
      carboidratos: [],
      proteinas: [],
      gorduras: [],
      fibras: [],
      acucares: [],
      sodio: [],
      potassio: [],
      calcio: [],
    };

    //itera sobre cada input e calcula os nutrientes
    $(".food-container input").each(function () {                 //seleciona todos os inputs dentro da classe food-container
      const alimentoId = $(this).attr("id").replace("qtd-", ""); //pega o nome do alimento
      const quantidade = Number.parseFloat($(this).val());      //obtem o valor digitado e converte para float

      if (!isNaN(quantidade) && quantidade > 0) {
        const nutrientes = alimentos[alimentoId];              //obtem os nutrientes do alimento em questao
        alimentosSelecionados.push(alimentoId);                //adiciona o alimento a lista, para assim manter o registro dos alimentos selecionados pelo o usuário

        for (const nutriente in nutrientesTotais) {            //armazena a quantidade total de cada nutriente consumido para cada alimento
          nutrientesTotais[nutriente].push((nutrientes[nutriente] * quantidade) / 100);
        }
      }
    });

    return { alimentosSelecionados, nutrientesTotais };
  }

  //função que calcula os totais de carboidratos, proteínas e gorduras
  function calcularTotaisTabela(nutrientesTotais) {
    return {
      carboidratos: nutrientesTotais.carboidratos.reduce((a, b) => a + b, 0),
      proteinas: nutrientesTotais.proteinas.reduce((a, b) => a + b, 0),
      gorduras: nutrientesTotais.gorduras.reduce((a, b) => a + b, 0),
    };
  }

  //função que preenche a tabela de refeições com os nutrientes calculados
  function preencherTabela(proximoDia, nutrientes) {
    const linhas = $(".tabela-semana tr").length - 2; //diminui as linhas do cabeçalho
    if (linhas >= 7) {
      alert("Não é possível adicionar mais refeições. Limite máximo de 7 dias atingido!");
      return;
    }

    //cria nova linha
    const linhaNova = $("<tr>")
    const tdDia = $("<td>").text(proximoDia)
    const tdCarb = $("<td>").text(nutrientes.carboidratos.toFixed(2))
    const tdProt = $("<td>").text(nutrientes.proteinas.toFixed(2))
    const tdGord = $("<td>").text(nutrientes.gorduras.toFixed(2))

    linhaNova.append(tdDia, tdCarb, tdProt, tdGord)
    $(".tabela-semana table").append(linhaNova)
  }

  //função para criar o gráfico de barras empilhadas que compara os nutrientes dos alimentos da refeição
  function criarGraficoGeral() {
    const resultado = calcularNutrientes();
    const alimentosSelecionados = resultado.alimentosSelecionados;
    const nutrientesTotais = resultado.nutrientesTotais;

    const ctx = $(".stackedBarChart")[0].getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: alimentosSelecionados,
        datasets: [
          { label: "Carboidratos (g)", data: nutrientesTotais.carboidratos, backgroundColor: "#FF6384" },
          { label: "Proteínas (g)", data: nutrientesTotais.proteinas, backgroundColor: "#36A2EB" },
          { label: "Gorduras (g)", data: nutrientesTotais.gorduras, backgroundColor: "#FFCE56" },
          { label: "Fibras (g)", data: nutrientesTotais.fibras, backgroundColor: "#4BC0C0" },
          { label: "Açúcares (g)", data: nutrientesTotais.acucares, backgroundColor: "#9966FF" },
          { label: "Sódio (g)", data: nutrientesTotais.sodio, backgroundColor: "#FF9F40" },
          { label: "Potássio (g)", data: nutrientesTotais.potassio, backgroundColor: "#C9CBCF" },
          { label: "Cálcio (g)", data: nutrientesTotais.calcio, backgroundColor: "#FF5733" },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "top",
          },
        },
        responsive: true,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true,
          },
        },
      },
    });
  }

  //função para criar o gráfico de linhas de micronutrientes
  function criarGraficoMicronutrientes() {
    const resultado = calcularNutrientes();
    const alimentosSelecionados = resultado.alimentosSelecionados;
    const nutrientesTotais = resultado.nutrientesTotais;

    const ctx = $(".line-chart")[0].getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: alimentosSelecionados,
        datasets: [
          { label: "Sódio (g)", data: nutrientesTotais.sodio, borderColor: "#FF6384", fill: false },
          { label: "Potássio (g)", data: nutrientesTotais.potassio, borderColor: "#36A2EB", fill: false },
          { label: "Cálcio (g)", data: nutrientesTotais.calcio, borderColor: "#FFCE56", fill: false },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "top",
          },
        },
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  //função para criar gráficos de pizza para cada alimento selecionado
  function criarGraficoMacronutrientes() {
    const resultado = calcularNutrientes();
    const alimentosSelecionados = resultado.alimentosSelecionados;
    const nutrientesTotais = resultado.nutrientesTotais;
    const cores = ["#FF6384", "#36A2EB", "#FFCE56"];

    const graficoContainer = document.getElementById("macronutrientes");
    graficoContainer.innerHTML = "";

    alimentosSelecionados.forEach((alimento, index) => {
      const graficoItem = document.createElement("div");
      graficoItem.classList.add("grafico-item");

      const titulo = document.createElement("h3");
      titulo.textContent = `${alimento.charAt(0).toUpperCase() + alimento.slice(1)}`;
      graficoItem.appendChild(titulo);

      const canvas = document.createElement("canvas");
      canvas.id = `grafico-${alimento}`;
      graficoItem.appendChild(canvas);

      graficoContainer.appendChild(graficoItem);

      const ctx = canvas.getContext("2d");
      const totalCarboidratos = nutrientesTotais.carboidratos[index];
      const totalProteinas = nutrientesTotais.proteinas[index];
      const totalGorduras = nutrientesTotais.gorduras[index];

      new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Carboidratos (g)", "Proteínas (g)", "Gorduras (g)"],
          datasets: [
            {
              data: [totalCarboidratos, totalProteinas, totalGorduras],
              backgroundColor: cores,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              position: "top",
            },
          },
          responsive: true,
        },
      });
    });
  }

  function graficoMetaDiaria() {
    const metaCarboidrato = Number.parseFloat($(".input-carbo").val()) || 0;
    const metaProteina = Number.parseFloat($(".input-proteina").val()) || 0;
    const metaGordura = Number.parseFloat($(".input-gordura").val()) || 0;

    if (metaCarboidrato === 0 && metaProteina === 0 && metaGordura === 0) {
      alert("Por favor, preencha as metas diárias antes de gerar o gráfico.");
      return;
    }

    const diasSemana = [];
    const porcentagemCarboidrato = [];
    const porcentagemProteina = [];
    const porcentagemGordura = [];

    $(".tabela-semana tr").each(function (index) {
      if (index < 2) return; //pular cabeçalho

      const colunas = $(this).find("td");
      const dia = $(colunas[0]).text();
      const carboidratos = Number.parseFloat($(colunas[1]).text()) || 0;
      const proteinas = Number.parseFloat($(colunas[2]).text()) || 0;
      const gorduras = Number.parseFloat($(colunas[3]).text()) || 0;

      if ((dia && carboidratos !== 0) || proteinas !== 0 || gorduras !== 0) {
        diasSemana.push(dia);
        porcentagemCarboidrato.push((carboidratos / metaCarboidrato) * 100);
        porcentagemProteina.push((proteinas / metaProteina) * 100);
        porcentagemGordura.push((gorduras / metaGordura) * 100);
      }
    })

    const chartElement = $(".line-chart")[1];
    const existingChart = Chart.getChart(chartElement);

    if (existingChart) {
      existingChart.destroy();
    }

    const ctx = chartElement.getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: diasSemana,
        datasets: [
          {
            label: "Carboidratos (%)",
            data: porcentagemCarboidrato,
            borderColor: "#FF6384",
            fill: false,
          },
          {
            label: "Proteínas (%)",
            data: porcentagemProteina,
            borderColor: "#36A2EB",
            fill: false,
          },
          {
            label: "Gorduras (%)",
            data: porcentagemGordura,
            borderColor: "#FFCE56",
            fill: false,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "top",
          },
        },
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 200,
            title: {
              display: true,
              text: "Porcentagem (%)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Dias da Semana",
            },
          },
        },
      },
    });
  }

  //variável para controlar se os gráficos já foram criados
  let graficosJaCriados = false;

  //função para atualizar os gráficos existentes
  function atualizarGraficos() {
    const resultado = calcularNutrientes();
    const alimentosSelecionados = resultado.alimentosSelecionados;
    const nutrientesTotais = resultado.nutrientesTotais;

    //atualiza o gráfico geral (barras empilhadas)
    const chartGeral = Chart.getChart($(".stackedBarChart")[0]);
    if (chartGeral) {
      chartGeral.data.labels = alimentosSelecionados;
      chartGeral.data.datasets.forEach((dataset, i) => {
        const nutriente = dataset.label.toLowerCase().replace(" (g)", "");
        dataset.data = nutrientesTotais[nutriente];
      });
      chartGeral.update("none"); //adicionado modo de atualização
    }

    //atualiza o gráfico de micronutrientes (linhas)
    const chartMicro = Chart.getChart($(".line-chart")[0]);
    if (chartMicro) {
      chartMicro.data.labels = alimentosSelecionados;
      chartMicro.data.datasets = [
        {
          label: "Sódio (g)",
          data: nutrientesTotais.sodio,
          borderColor: "#FF6384",
          fill: false,
        },
        {
          label: "Potássio (g)",
          data: nutrientesTotais.potassio,
          borderColor: "#36A2EB",
          fill: false,
        },
        {
          label: "Cálcio (g)",
          data: nutrientesTotais.calcio,
          borderColor: "#FFCE56",
          fill: false,
        },
      ];
      chartMicro.update("none"); //adicionado modo de atualização
    }

    //atualiza os gráficos de macronutrientes (pizza)
    const graficoContainer = document.getElementById("macronutrientes");
    graficoContainer.innerHTML = "";

    alimentosSelecionados.forEach((alimento, index) => {
      const graficoItem = document.createElement("div");
      graficoItem.classList.add("grafico-item");

      const titulo = document.createElement("h3");
      titulo.textContent = `${alimento.charAt(0).toUpperCase() + alimento.slice(1)}`;
      graficoItem.appendChild(titulo);

      const canvas = document.createElement("canvas");
      canvas.id = `grafico-${alimento}`;
      graficoItem.appendChild(canvas);

      graficoContainer.appendChild(graficoItem);

      const ctx = canvas.getContext("2d");
      const totalCarboidratos = nutrientesTotais.carboidratos[index];
      const totalProteinas = nutrientesTotais.proteinas[index];
      const totalGorduras = nutrientesTotais.gorduras[index];

      new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Carboidratos (g)", "Proteínas (g)", "Gorduras (g)"],
          datasets: [
            {
              data: [totalCarboidratos, totalProteinas, totalGorduras],
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              position: "top",
            },
          },
          responsive: true,
        },
      });
    });
  }

  //evento para gerar os gráficos
  $("#button-visualizacao").click(() => {
    if (!graficosJaCriados) {
      criarGraficoGeral();
      criarGraficoMicronutrientes();
      criarGraficoMacronutrientes();
      graficosJaCriados = true;
    } else {
      atualizarGraficos();
    }

    //mostra a tela-2 (graficos nutricionais e input meta diaria) após o clique no botão
    $(".tela-2").fadeIn();
  })

  //evento que mostra a tela-3 (refeições da semana)
  $("#button-enviar-meta").click(() => {
    $(".tela-3").fadeIn();
  })

  //evento que mostra a tabela e gera o gráfico meta diária
  $("#button-refeicao").click(() => {
    const resultado = calcularNutrientes();
    const nutrientes = calcularTotaisTabela(resultado.nutrientesTotais);
    const proximoDia = getProximoDiaDisponivel();
    preencherTabela(proximoDia, nutrientes);
    graficoMetaDiaria();
  })
})