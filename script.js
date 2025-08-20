document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('combustivel-form');
    const relatorioOutput = document.getElementById('relatorio-output');
    const gerarPdfBtn = document.getElementById('gerar-pdf');
    const gerarImagemBtn = document.getElementById('gerar-imagem');
    let lancamentos = [];
    let relatorioNumero = Math.floor(Math.random() * 100000);

    const formatarMoeda = (valor) => {
        return `R$ ${valor.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}`;
    };

    const arredondarIRPJ = (valor) => {
        return Math.round(valor * 100) / 100;
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const posto = document.getElementById('posto').value;
        const lotacao = document.getElementById('lotacao').value;
        const tipo = document.getElementById('tipo').value;
        const litros = parseFloat(document.getElementById('litros').value) || 0;
        const valor = parseFloat(document.getElementById('valor').value);
        const recurso = document.getElementById('recurso').value;

        if (!lotacao || !tipo || isNaN(valor) || valor <= 0) {
            alert("Por favor, preencha todos os campos obrigatórios: Lotação, Tipo e Valor.");
            return;
        }

        const irpj = arredondarIRPJ(valor * 0.0024);
        const lancamento = { posto, lotacao, tipo, litros, valor, recurso, irpj };
        lancamentos.push(lancamento);

        renderizarRelatorio();
        form.reset();
    });

    function renderizarRelatorio() {
        if (lancamentos.length === 0) {
            relatorioOutput.innerHTML = '<p>Nenhum lançamento adicionado.</p>';
            return;
        }

        let html = `
            <div class="relatorio-header">
                <h2>Relatório de Pagamento de Combustível</h2>
                <h3>Prefeitura Municipal de Chã Preta/AL</h3>
                <h3>Secretaria Municipal de Finanças</h3>
                <p>Data: ${new Date().toLocaleDateString()} - Relatório nº: ${relatorioNumero}</p>
            </div>
        `;

        const lancamentosPorPosto = lancamentos.reduce((acc, current) => {
            (acc[current.posto] = acc[current.posto] || []).push(current);
            return acc;
        }, {});

        let totalGeralValor = 0;

        for (const posto in lancamentosPorPosto) {
            const itensDoPosto = lancamentosPorPosto[posto];
            let totalPostoGasolinaLitros = 0;
            let totalPostoGasolinaValor = 0;
            let totalPostoDieselLitros = 0;
            let totalPostoDieselValor = 0;
            let totalPostoEtanolLitros = 0;
            let totalPostoEtanolValor = 0;

            html += `<h4 class="posto-sub-header">Posto de Combustível: ${posto}</h4>`;
            html += `
                <table>
                    <thead>
                        <tr>
                            <th>Lotação</th>
                            <th>Tipo</th>
                            <th>Litros</th>
                            <th>Recurso</th>
                            <th>Valor</th>
                            <th>IRPJ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            itensDoPosto.forEach(item => {
                const destaque = item.recurso !== 'Rec. Próprio' ? 'class="destaque"' : '';
                html += `
                    <tr ${destaque}>
                        <td>${item.lotacao}</td>
                        <td>${item.tipo}</td>
                        <td>${item.litros.toFixed(2).replace('.', ',')}</td>
                        <td>${item.recurso}</td>
                        <td>${formatarMoeda(item.valor)}</td>
                        <td>${formatarMoeda(item.irpj)}</td>
                    </tr>
                `;
                
                if (item.tipo === 'Gasolina Comum') {
                    totalPostoGasolinaLitros += item.litros;
                    totalPostoGasolinaValor += item.valor;
                } else if (item.tipo === 'Diesel S10') {
                    totalPostoDieselLitros += item.litros;
                    totalPostoDieselValor += item.valor;
                } else if (item.tipo === 'Etanol (Álcool Etílico)') {
                    totalPostoEtanolLitros += item.litros;
                    totalPostoEtanolValor += item.valor;
                }
            });

            html += `
                    </tbody>
                </table>
                <div class="totalizacoes">
                    <h4>Totalizações do Posto</h4>
                    <p><strong>Litros de Gasolina:</strong> ${totalPostoGasolinaLitros.toFixed(2).replace('.', ',')} L</p>
                    <p><strong>Valor da Gasolina:</strong> ${formatarMoeda(totalPostoGasolinaValor)}</p>
                    <p><strong>Litros de Diesel:</strong> ${totalPostoDieselLitros.toFixed(2).replace('.', ',')} L</p>
                    <p><strong>Valor do Diesel:</strong> ${formatarMoeda(totalPostoDieselValor)}</p>
                    <p><strong>Litros de Etanol:</strong> ${totalPostoEtanolLitros.toFixed(2).replace('.', ',')} L</p>
                    <p><strong>Valor do Etanol:</strong> ${formatarMoeda(totalPostoEtanolValor)}</p>
                </div>
            `;
            totalGeralValor += totalPostoGasolinaValor + totalPostoDieselValor + totalPostoEtanolValor;
        }
        
        html += `
            <div class="total-geral">
                Valor Total Geral: ${formatarMoeda(totalGeralValor)}
            </div>
        `;

        relatorioOutput.innerHTML = html;
    }

    gerarPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4'); // 'p' para vertical, 'pt' para pontos
        const element = document.getElementById('relatorio-output');

        doc.html(element, {
            callback: function (doc) {
                doc.save('relatorio-combustivel.pdf');
            },
            x: 15,
            y: 15,
            html2canvas: { scale: 0.6 } // Ajusta a escala para caber na página
        });
    });

    gerarImagemBtn.addEventListener('click', () => {
        const element = document.getElementById('relatorio-output');

        html2canvas(element, { scale: 2 }).then(canvas => {
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = 'relatorio-combustivel.png';
            link.click();
        });
    });
});