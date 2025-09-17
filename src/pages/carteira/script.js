const ativos = [
    { ticker: "PETR4", nome: "Petrobras PN", quantidade: 100, precoMedio: 28.50, precoAtual: 32.15 },
    { ticker: "VALE3", nome: "Vale ON", quantidade: 50, precoMedio: 65.80, precoAtual: 68.90 },
    { ticker: "ITUB4", nome: "Itaú Unibanco PN", quantidade: 200, precoMedio: 25.30, precoAtual: 24.85 },
    { ticker: "BBDC4", nome: "Bradesco PN", quantidade: 150, precoMedio: 15.20, precoAtual: 16.45 }
];

function formatarMoeda(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

function calcularDadosAtivo(ativo) {
    const totalInvestido = ativo.quantidade * ativo.precoMedio;
    const valorAtual = ativo.quantidade * ativo.precoAtual;
    const resultado = valorAtual - totalInvestido;
    const porcentagem = (resultado / totalInvestido) * 100;
    const tipo = resultado >= 0 ? 'positive' : 'negative';

    return {
        ...ativo,
        totalInvestido,
        valorAtual,
        resultado,
        porcentagem,
        tipo,
    };
}

function renderizarTabela() {
    const tbody = document.getElementById('tabela-corpo');
    tbody.innerHTML = ''; // Limpa a tabela antes de renderizar

    ativos.forEach(ativo => {
        const dadosCalculados = calcularDadosAtivo(ativo);
        const linha = document.createElement('tr');

        linha.innerHTML = `
            <td>
                <div class="asset-info">
                    <span class="ticker">${dadosCalculados.ticker}</span>
                    <span class="name">${dadosCalculados.nome}</span>
                </div>
            </td>
            <td>${dadosCalculados.quantidade}</td>
            <td>${formatarMoeda(dadosCalculados.precoMedio)}</td>
            <td>${formatarMoeda(dadosCalculados.precoAtual)}</td>
            <td><span class="change-${dadosCalculados.tipo}">${dadosCalculados.tipo === 'positive' ? '+' : ''}${dadosCalculados.porcentagem.toFixed(2).replace('.', ',')}%</span></td>
            <td>${formatarMoeda(dadosCalculados.totalInvestido)}</td>
            <td>${formatarMoeda(dadosCalculados.valorAtual)}</td>
            <td>
                <div class="result-info">
                    <span class="result-${dadosCalculados.tipo}">${dadosCalculados.tipo === 'positive' ? '+' : '-'} ${formatarMoeda(Math.abs(dadosCalculados.resultado))}</span>
                    <span class="percentage-${dadosCalculados.tipo}">(${dadosCalculados.porcentagem.toFixed(2).replace('.', ',')}%)</span>
                </div>
            </td>
        `;

        tbody.appendChild(linha);
    });
}

document.addEventListener('DOMContentLoaded', renderizarTabela);